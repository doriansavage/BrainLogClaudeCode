/**
 * Shopify Verification Script — Multi-signal scoring (HTTP only, no browser)
 *
 * Vérifie si un site est VRAIMENT un site Shopify,
 * et non un blog/article qui mentionne Shopify.
 *
 * Signaux vérifiés (score /100) :
 *  +30  /cart.json retourne du JSON Shopify valide (token + items)
 *  +25  Cookies _shopify_s ou _shopify_y dans les headers Set-Cookie
 *  +15  Header X-ShopId ou X-Shopify-Stage
 *  +10  meta shopify-checkout-api-token dans le HTML
 *  +10  window.Shopify ou Shopify.shop dans un <script> inline
 *  +5   Lien/form action vers checkout.shopify.com
 *  +5   <script src="cdn.shopify.com/s/"> ou <link href="cdn.shopify.com/shopifycloud">
 *  +5   /collections ou /products retournent 200
 *  -20  Semble être un blog (article tags, .post-content, wp-content)
 *
 * Seuil : score >= 30 = Shopify confirmé
 *
 * Usage : npx tsx scripts/shopify-verify.ts [--input file.json]
 * Input  : storage/shopify-belgium-discovered.json
 * Output : storage/shopify-belgium-verified.json
 */

import { CheerioCrawler } from 'crawlee';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ─── Configuration ───────────────────────────────────────────────
const INPUT_FILE = process.argv.includes('--input')
  ? process.argv[process.argv.indexOf('--input') + 1]
  : 'storage/shopify-belgium-discovered.json';
const OUTPUT_FILE = 'storage/shopify-belgium-verified.json';
const CONCURRENCY = 5;
const TIMEOUT_SECS = 15;

interface DiscoveredSite {
  url: string;
  domain: string;
  tld: string;
  source?: string;
  discoveredAt: string;
  verified: boolean;
}

interface VerifiedSite {
  url: string;
  domain: string;
  isShopify: boolean;
  score: number;
  signals: string[];
  shopName?: string;
  verifiedAt: string;
}

const results: VerifiedSite[] = [];
let processed = 0;
let totalToVerify = 0;

function saveResults() {
  const sorted = [...results].sort((a, b) => {
    if (a.isShopify && !b.isShopify) return -1;
    if (!a.isShopify && b.isShopify) return 1;
    return b.score - a.score;
  });
  writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2), 'utf-8');
}

// ─── Phase 1 : Vérification page d'accueil ──────────────────────
async function verifyHomepages(sites: DiscoveredSite[]) {
  console.log(`\n🏠 Phase 1 : Vérification HTML des pages d'accueil (${sites.length} sites)\n`);

  // Map pour stocker les scores partiels par domaine
  const scores = new Map<string, { score: number; signals: string[]; shopName?: string }>();

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log, response }) {
      const siteUrl = request.userData.siteUrl as string;
      const domain = request.userData.domain as string;

      let score = 0;
      const signals: string[] = [];
      let shopName: string | undefined;

      // ─── Signal : Headers HTTP ──────────────────────────────
      const headers = response.headers;

      // X-ShopId / X-Shopify-Stage
      if (headers['x-shopid'] || headers['x-shopify-stage']) {
        score += 15;
        signals.push(`header:${headers['x-shopid'] ? 'X-ShopId=' + headers['x-shopid'] : 'X-Shopify-Stage'}`);
      }

      // Cookies Shopify dans Set-Cookie
      const setCookies = Array.isArray(headers['set-cookie'])
        ? headers['set-cookie']
        : headers['set-cookie'] ? [headers['set-cookie']] : [];
      const cookieStr = setCookies.join(' ');

      if (cookieStr.includes('_shopify_s') || cookieStr.includes('_shopify_y')) {
        score += 25;
        signals.push('cookies:_shopify_s/_shopify_y');
      } else if (cookieStr.includes('_shopify_sa_t') || cookieStr.includes('cart_currency')) {
        score += 10;
        signals.push('cookies:_shopify_sa_t/cart_currency');
      }

      // Powered by header
      const poweredBy = (headers['x-powered-by'] || '').toString().toLowerCase();
      if (poweredBy.includes('shopify')) {
        score += 10;
        signals.push('header:X-Powered-By=Shopify');
      }

      // ─── Signal : Meta tags ─────────────────────────────────
      const checkoutToken = $('meta[name="shopify-checkout-api-token"]').attr('content');
      if (checkoutToken) {
        score += 10;
        signals.push('meta:shopify-checkout-api-token');
      }

      // ─── Signal : window.Shopify dans les scripts inline ────
      let foundShopifyObj = false;
      $('script:not([src])').each((_, el) => {
        const text = $(el).html() || '';
        if (text.includes('Shopify.shop') || text.includes('window.Shopify') || /Shopify\s*=\s*\{/.test(text)) {
          foundShopifyObj = true;
          // Essayer d'extraire le nom du shop
          const shopMatch = text.match(/Shopify\.shop\s*=\s*["']([^"']+)["']/);
          if (shopMatch) shopName = shopMatch[1];
        }
      });

      if (foundShopifyObj) {
        score += 10;
        signals.push('js:Shopify object in inline script');
      }

      // ─── Signal : <script src="cdn.shopify.com/s/"> ────────
      // IMPORTANT : on vérifie que c'est dans un <script src> ou <link href>,
      // PAS juste mentionné dans du texte (sinon les blogs matchent)
      let hasShopifyCdnAsset = false;
      $('script[src*="cdn.shopify.com/s/"], script[src*="cdn.shopify.com/shopifycloud"]').each(() => {
        hasShopifyCdnAsset = true;
      });
      $('link[href*="cdn.shopify.com/s/"], link[href*="cdn.shopify.com/shopifycloud"]').each(() => {
        hasShopifyCdnAsset = true;
      });

      if (hasShopifyCdnAsset) {
        score += 5;
        signals.push('html:cdn.shopify.com asset (script/link src)');
      }

      // ─── Signal : checkout.shopify.com link ─────────────────
      let hasCheckoutLink = false;
      $('a[href*="checkout.shopify.com"], form[action*="checkout.shopify.com"]').each(() => {
        hasCheckoutLink = true;
      });
      $('a[href*=".myshopify.com/checkout"], form[action*=".myshopify.com/checkout"]').each(() => {
        hasCheckoutLink = true;
      });

      if (hasCheckoutLink) {
        score += 5;
        signals.push('html:checkout.shopify.com link');
      }

      // ─── Signal : "Powered by Shopify" dans le footer ───────
      const footerText = ($('footer').text() || '').toLowerCase();
      if (footerText.includes('powered by shopify') || footerText.includes('propulsé par shopify')) {
        score += 5;
        signals.push('html:footer "powered by shopify"');
      }

      // ─── Malus : blog/article ───────────────────────────────
      // Ces sélecteurs indiquent un blog/CMS qui PARLE de Shopify
      const blogIndicators = [
        'article.post', '.post-content', '.blog-post', '.entry-content',
        '.wp-content', '#comments', '.article-body', '.post-meta',
        '.blog-entry', '.wordpress',
      ];
      let blogScore = 0;
      for (const sel of blogIndicators) {
        if ($(sel).length > 0) blogScore++;
      }
      // Vérifier contenu textuel de type "review"
      const bodyText = ($('body').text() || '').toLowerCase();
      const reviewKeywords = ['shopify vs', 'review shopify', 'avis shopify', 'alternative shopify', 'comparatif shopify'];
      for (const kw of reviewKeywords) {
        if (bodyText.includes(kw)) blogScore += 2;
      }

      if (blogScore >= 2 && score < 40) {
        score -= 20;
        signals.push(`MALUS:blog/article (indicators=${blogScore})`);
      }

      // Shop name fallback
      if (!shopName) {
        shopName = $('meta[property="og:site_name"]').attr('content') || undefined;
      }

      scores.set(domain, { score, signals, shopName });

      processed++;
      const icon = score >= 30 ? '✅' : score >= 15 ? '🟡' : '❌';
      log.info(`${icon} [${processed}/${totalToVerify}] ${domain} — score: ${score} [${signals.join(', ')}]`);
    },

    async failedRequestHandler({ request, log }) {
      const domain = request.userData.domain as string;
      scores.set(domain, { score: -1, signals: ['error:unreachable'] });
      processed++;
      log.info(`💀 [${processed}/${totalToVerify}] ${domain} — unreachable`);
    },

    maxRequestsPerCrawl: sites.length,
    maxConcurrency: CONCURRENCY,
    navigationTimeoutSecs: TIMEOUT_SECS,
    requestHandlerTimeoutSecs: TIMEOUT_SECS * 2,
    maxRequestRetries: 0,
  });

  const requests = sites.map(site => ({
    url: site.url,
    userData: { siteUrl: site.url, domain: site.domain },
  }));

  await crawler.run(requests);

  return scores;
}

// ─── Phase 2 : Vérification /cart.json ──────────────────────────
async function verifyCartJson(
  sites: DiscoveredSite[],
  scores: Map<string, { score: number; signals: string[]; shopName?: string }>,
) {
  // Ne vérifier /cart.json que pour les sites avec un score >= 5 (potentiels)
  const candidates = sites.filter(s => {
    const data = scores.get(s.domain);
    return data && data.score >= 5;
  });

  if (candidates.length === 0) {
    console.log('\n⏭️  Aucun candidat pour la vérification /cart.json\n');
    return;
  }

  console.log(`\n🛒 Phase 2 : Vérification /cart.json (${candidates.length} candidats)\n`);

  const crawler = new CheerioCrawler({
    async requestHandler({ body, request, log, response }) {
      const domain = request.userData.domain as string;
      const data = scores.get(domain);
      if (!data) return;

      try {
        const contentType = (response.headers['content-type'] || '').toString();
        if (!contentType.includes('json')) {
          log.info(`  ⏭️ ${domain}/cart.json — not JSON (${contentType.slice(0, 30)})`);
          return;
        }

        const cart = JSON.parse(body.toString());

        // Un vrai cart.json Shopify a ces champs
        if (
          ('token' in cart && 'items' in cart && Array.isArray(cart.items)) ||
          ('item_count' in cart && 'items' in cart)
        ) {
          data.score += 30;
          data.signals.push('api:/cart.json valid (Shopify cart structure)');
          log.info(`  ✅ ${domain}/cart.json — VALID Shopify cart`);
        } else {
          log.info(`  ❌ ${domain}/cart.json — JSON but not Shopify structure`);
        }
      } catch {
        log.info(`  ⏭️ ${domain}/cart.json — parse error`);
      }
    },

    async failedRequestHandler({ request, log }) {
      const domain = request.userData.domain as string;
      log.info(`  ⏭️ ${domain}/cart.json — failed`);
    },

    maxRequestsPerCrawl: candidates.length,
    maxConcurrency: CONCURRENCY,
    navigationTimeoutSecs: TIMEOUT_SECS,
    maxRequestRetries: 0,
  });

  const requests = candidates.map(site => ({
    url: `${site.url}/cart.json`,
    userData: { domain: site.domain },
  }));

  await crawler.run(requests);
}

// ─── Phase 3 : Vérification /collections ────────────────────────
async function verifyCollections(
  sites: DiscoveredSite[],
  scores: Map<string, { score: number; signals: string[]; shopName?: string }>,
) {
  const candidates = sites.filter(s => {
    const data = scores.get(s.domain);
    return data && data.score >= 5;
  });

  if (candidates.length === 0) return;

  console.log(`\n📦 Phase 3 : Vérification /collections (${candidates.length} candidats)\n`);

  const crawler = new CheerioCrawler({
    async requestHandler({ request, log, response }) {
      const domain = request.userData.domain as string;
      const data = scores.get(domain);
      if (!data) return;

      if (response.statusCode === 200) {
        data.score += 5;
        data.signals.push('route:/collections (200)');
        log.info(`  ✅ ${domain}/collections — 200 OK`);
      }
    },

    async failedRequestHandler({ request, log }) {
      // pas grave, c'est un signal bonus
    },

    maxRequestsPerCrawl: candidates.length,
    maxConcurrency: CONCURRENCY,
    navigationTimeoutSecs: TIMEOUT_SECS,
    maxRequestRetries: 0,
  });

  const requests = candidates.map(site => ({
    url: `${site.url}/collections`,
    userData: { domain: site.domain },
  }));

  await crawler.run(requests);
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 Shopify Verification — Multi-signal scoring');
  console.log('═══════════════════════════════════════════════\n');

  if (!existsSync(INPUT_FILE)) {
    console.error(`❌ Fichier introuvable : ${INPUT_FILE}`);
    console.error('   Lancez d\'abord : npx tsx scripts/shopify-discover-belgium.ts');
    process.exit(1);
  }

  const discovered: DiscoveredSite[] = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`📂 ${discovered.length} URLs à vérifier\n`);

  // Charger les résultats existants
  const alreadyVerified = new Set<string>();
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing: VerifiedSite[] = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      for (const site of existing) {
        alreadyVerified.add(site.domain);
        results.push(site);
      }
      console.log(`⏭️  ${alreadyVerified.size} déjà vérifiés, skip\n`);
    } catch { /* fresh start */ }
  }

  const toVerify = discovered.filter(d => !alreadyVerified.has(d.domain));
  totalToVerify = toVerify.length;

  if (toVerify.length === 0) {
    console.log('✅ Tous les sites sont déjà vérifiés !');
    printSummary();
    return;
  }

  console.log(`🚀 Vérification de ${toVerify.length} sites...\n`);

  // Phase 1 : Vérification HTML
  const scores = await verifyHomepages(toVerify);

  // Phase 2 : /cart.json pour les candidats
  await verifyCartJson(toVerify, scores);

  // Phase 3 : /collections pour les candidats
  await verifyCollections(toVerify, scores);

  // Compiler les résultats
  for (const site of toVerify) {
    const data = scores.get(site.domain);
    if (!data) continue;

    results.push({
      url: site.url,
      domain: site.domain,
      isShopify: data.score >= 30,
      score: data.score,
      signals: data.signals,
      shopName: data.shopName,
      verifiedAt: new Date().toISOString(),
    });
  }

  saveResults();
  printSummary();
}

function printSummary() {
  const shopifySites = results.filter(r => r.isShopify);
  const nonShopify = results.filter(r => !r.isShopify);
  const errors = results.filter(r => r.signals.includes('error:unreachable'));

  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 Résultats de vérification`);
  console.log(`   Total vérifié  : ${results.length}`);
  console.log(`   ✅ Shopify      : ${shopifySites.length}`);
  console.log(`   ❌ Non-Shopify  : ${nonShopify.length}`);
  console.log(`   💀 Erreurs      : ${errors.length}`);
  console.log(`\n📁 Output : ${OUTPUT_FILE}`);

  if (shopifySites.length > 0) {
    console.log('\n🏪 Sites Shopify confirmés :\n');
    for (const site of shopifySites.slice(0, 80)) {
      console.log(`   ${site.score.toString().padStart(3)}/100  ${site.domain}${site.shopName ? ` — ${site.shopName}` : ''}`);
    }
    if (shopifySites.length > 80) {
      console.log(`   ... et ${shopifySites.length - 80} autres`);
    }
  }
}

main().catch(console.error);

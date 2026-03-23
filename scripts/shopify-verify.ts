/**
 * Shopify Verification Script — Multi-signal scoring
 *
 * Vérifie si un site est VRAIMENT un site Shopify,
 * et non un blog/article qui mentionne Shopify.
 *
 * Signaux vérifiés (score /100) :
 *  +30  /cart.json retourne du JSON Shopify valide
 *  +25  Cookies _shopify_s ou _shopify_y présents
 *  +15  Header X-ShopId ou X-Shopify-Stage
 *  +10  window.Shopify existe dans le JS
 *  +10  meta shopify-checkout-api-token
 *  +5   Lien vers checkout.shopify.com dans le HTML
 *  +5   Routes /collections ou /products fonctionnelles
 *  -20  Semble être un blog/article (balises article, .post-content, etc.)
 *
 * Seuil : score >= 30 = Shopify confirmé
 *
 * Usage : npx tsx scripts/shopify-verify.ts
 * Input  : storage/shopify-belgium-discovered.json
 * Output : storage/shopify-belgium-verified.json
 */

import { PlaywrightCrawler } from 'crawlee';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ─── Configuration ───────────────────────────────────────────────
const INPUT_FILE = 'storage/shopify-belgium-discovered.json';
const OUTPUT_FILE = 'storage/shopify-belgium-verified.json';
const CONCURRENCY = 3;
const TIMEOUT_SECS = 20;

interface DiscoveredSite {
  url: string;
  domain: string;
  tld: string;
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

// ─── Main Crawler ────────────────────────────────────────────────
async function main() {
  console.log('🔍 Shopify Verification — Multi-signal scoring');
  console.log('═══════════════════════════════════════════════\n');

  // Charger les URLs à vérifier
  if (!existsSync(INPUT_FILE)) {
    console.error(`❌ Fichier introuvable : ${INPUT_FILE}`);
    console.error('   Lancez d\'abord : npx tsx scripts/shopify-discover-belgium.ts');
    process.exit(1);
  }

  const discovered: DiscoveredSite[] = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`📂 ${discovered.length} URLs à vérifier\n`);

  // Charger les résultats existants pour ne pas re-vérifier
  const alreadyVerified = new Set<string>();
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing: VerifiedSite[] = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      for (const site of existing) {
        alreadyVerified.add(site.url);
        results.push(site);
      }
      console.log(`⏭️  ${alreadyVerified.size} déjà vérifiés, skip\n`);
    } catch { /* fresh start */ }
  }

  const toVerify = discovered.filter(d => !alreadyVerified.has(d.url));
  if (toVerify.length === 0) {
    console.log('✅ Tous les sites sont déjà vérifiés !');
    printSummary();
    return;
  }

  console.log(`🚀 Vérification de ${toVerify.length} sites...\n`);

  const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
      const siteUrl = request.userData.siteUrl as string;
      const domain = request.userData.domain as string;
      log.info(`Checking: ${domain}`);

      let score = 0;
      const signals: string[] = [];
      let shopName: string | undefined;

      try {
        // ─── Signal 1 : Charger la page d'accueil ───────────────
        await page.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_SECS * 1000 });
        await page.waitForTimeout(2000);

        // ─── Signal 2 : Cookies Shopify ─────────────────────────
        const cookies = await page.context().cookies();
        const cookieNames = cookies.map(c => c.name);

        if (cookieNames.some(n => n === '_shopify_s' || n === '_shopify_y')) {
          score += 25;
          signals.push('cookies:_shopify_s/_shopify_y');
        }
        if (cookieNames.some(n => n === 'cart_currency' || n === '_shopify_sa_t')) {
          score += 5;
          signals.push('cookies:cart_currency/_shopify_sa_t');
        }

        // ─── Signal 3 : Headers HTTP (via response interception) ─
        // On refait une requête fetch pour les headers
        const headers = await page.evaluate(async (url) => {
          try {
            const resp = await fetch(url, { method: 'HEAD', redirect: 'follow' });
            const h: Record<string, string> = {};
            resp.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
            return h;
          } catch { return {}; }
        }, siteUrl);

        if (headers['x-shopid'] || headers['x-shopify-stage']) {
          score += 15;
          signals.push(`header:${headers['x-shopid'] ? 'X-ShopId=' + headers['x-shopid'] : 'X-Shopify-Stage'}`);
        }

        // ─── Signal 4 : window.Shopify dans le JS ───────────────
        const hasShopifyObj = await page.evaluate(() => {
          const w = window as any;
          if (w.Shopify && typeof w.Shopify === 'object') {
            return {
              exists: true,
              shop: w.Shopify.shop || null,
              theme: w.Shopify.theme?.name || null,
            };
          }
          return { exists: false, shop: null, theme: null };
        });

        if (hasShopifyObj.exists) {
          score += 10;
          signals.push('js:window.Shopify');
          if (hasShopifyObj.shop) {
            shopName = hasShopifyObj.shop;
            signals.push(`shop:${hasShopifyObj.shop}`);
          }
        }

        // ─── Signal 5 : Meta tag shopify-checkout-api-token ─────
        const hasCheckoutToken = await page.$('meta[name="shopify-checkout-api-token"]');
        if (hasCheckoutToken) {
          score += 10;
          signals.push('meta:shopify-checkout-api-token');
        }

        // ─── Signal 6 : Lien checkout.shopify.com ───────────────
        const hasCheckoutLink = await page.$$eval('a[href], form[action]', els => {
          return els.some(el => {
            const url = (el as HTMLAnchorElement).href || (el as HTMLFormElement).action || '';
            return url.includes('checkout.shopify.com') || url.includes('.myshopify.com/checkout');
          });
        });

        if (hasCheckoutLink) {
          score += 5;
          signals.push('html:checkout.shopify.com');
        }

        // ─── Signal 7 : Script Shopify dans le HTML ─────────────
        const hasShopifyScripts = await page.$$eval('script[src], link[href]', els => {
          return els.some(el => {
            const src = (el as HTMLScriptElement).src || (el as HTMLLinkElement).href || '';
            return src.includes('cdn.shopify.com/s/') || src.includes('cdn.shopify.com/shopifycloud');
          });
        });

        if (hasShopifyScripts) {
          score += 5;
          signals.push('html:cdn.shopify.com/s/ (script/link)');
        }

        // ─── Signal 8 : /cart.json (le plus fiable) ─────────────
        const cartJson = await page.evaluate(async (baseUrl) => {
          try {
            const resp = await fetch(`${baseUrl}/cart.json`, { redirect: 'follow' });
            if (!resp.ok) return null;
            const contentType = resp.headers.get('content-type') || '';
            if (!contentType.includes('json')) return null;
            const data = await resp.json();
            // Un vrai cart.json Shopify a ces champs
            if ('token' in data && 'items' in data && Array.isArray(data.items)) {
              return { valid: true, token: data.token };
            }
            if ('item_count' in data && 'items' in data) {
              return { valid: true, token: null };
            }
            return null;
          } catch { return null; }
        }, siteUrl);

        if (cartJson?.valid) {
          score += 30;
          signals.push('api:/cart.json valid');
        }

        // ─── Signal 9 : Routes /collections ou /products ────────
        const hasShopRoutes = await page.evaluate(async (baseUrl) => {
          const routes = ['/collections', '/products'];
          for (const route of routes) {
            try {
              const resp = await fetch(`${baseUrl}${route}`, { method: 'HEAD', redirect: 'follow' });
              if (resp.ok) return route;
            } catch { /* continue */ }
          }
          return null;
        }, siteUrl);

        if (hasShopRoutes) {
          score += 5;
          signals.push(`route:${hasShopRoutes} (200)`);
        }

        // ─── Malus : Détection blog/article ─────────────────────
        // Si la page est clairement un blog qui PARLE de Shopify
        const isBlogLike = await page.evaluate(() => {
          const indicators = [
            'article.post', '.post-content', '.blog-post', '.entry-content',
            'article[class*="post"]', '.wp-content', '#comments',
            'article.article', '.article-body',
          ];
          for (const sel of indicators) {
            if (document.querySelector(sel)) return true;
          }
          // Vérifier si le texte contient des comparaisons "Shopify vs"
          const body = document.body?.innerText || '';
          const blogKeywords = ['shopify vs', 'review shopify', 'avis shopify', 'alternative à shopify', 'meilleur shopify'];
          const matches = blogKeywords.filter(kw => body.toLowerCase().includes(kw));
          return matches.length >= 2;
        });

        if (isBlogLike && score < 30) {
          score -= 20;
          signals.push('MALUS:blog/article detected');
        }

        // ─── Extraire le nom du shop si pas encore trouvé ───────
        if (!shopName) {
          shopName = await page.evaluate(() => {
            const w = window as any;
            return w.Shopify?.shop ||
              document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
              document.title?.split(/[–—|]/).map((s: string) => s.trim()).pop() ||
              null;
          });
        }

      } catch (e: any) {
        signals.push(`error:${e.message?.slice(0, 80)}`);
      }

      const result: VerifiedSite = {
        url: siteUrl,
        domain,
        isShopify: score >= 30,
        score,
        signals,
        shopName: shopName || undefined,
        verifiedAt: new Date().toISOString(),
      };

      results.push(result);

      const icon = result.isShopify ? '✅' : '❌';
      log.info(`${icon} ${domain} — score: ${score}/100 [${signals.join(', ')}]`);

      // Sauvegarder après chaque vérification (progression incrémentale)
      saveResults();
    },

    maxRequestsPerCrawl: toVerify.length,
    maxConcurrency: CONCURRENCY,
    headless: true,
    navigationTimeoutSecs: TIMEOUT_SECS,
    requestHandlerTimeoutSecs: TIMEOUT_SECS * 2,
    maxRequestRetries: 0, // pas de retry, on passe au suivant
    launchContext: {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
  });

  const requests = toVerify.map(site => ({
    url: site.url,
    userData: { siteUrl: site.url, domain: site.domain },
  }));

  await crawler.run(requests);

  saveResults();
  printSummary();
}

function saveResults() {
  // Trier : Shopify d'abord, puis par score décroissant
  const sorted = [...results].sort((a, b) => {
    if (a.isShopify && !b.isShopify) return -1;
    if (!a.isShopify && b.isShopify) return 1;
    return b.score - a.score;
  });

  writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2), 'utf-8');
}

function printSummary() {
  const shopifySites = results.filter(r => r.isShopify);
  const nonShopify = results.filter(r => !r.isShopify);

  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 Résultats de vérification`);
  console.log(`   Total vérifié  : ${results.length}`);
  console.log(`   ✅ Shopify      : ${shopifySites.length}`);
  console.log(`   ❌ Non-Shopify  : ${nonShopify.length}`);
  console.log(`\n📁 Output : ${OUTPUT_FILE}`);

  if (shopifySites.length > 0) {
    console.log('\n🏪 Sites Shopify confirmés :\n');
    for (const site of shopifySites.slice(0, 50)) {
      console.log(`   ${site.score.toString().padStart(3)}/100  ${site.domain}${site.shopName ? ` (${site.shopName})` : ''}`);
    }
    if (shopifySites.length > 50) {
      console.log(`   ... et ${shopifySites.length - 50} autres`);
    }
  }
}

main().catch(console.error);

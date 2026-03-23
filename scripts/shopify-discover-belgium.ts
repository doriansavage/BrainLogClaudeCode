/**
 * Shopify URL Discovery — Belgian Sites
 *
 * Sources utilisées :
 * 1. DuckDuckGo dorks (site:.be + signatures Shopify)
 * 2. crt.sh (Certificate Transparency — *.myshopify.com avec noms belges)
 * 3. Vérification Shopify robuste (multi-signaux)
 *
 * Usage : npx tsx scripts/shopify-discover-belgium.ts
 * Output : storage/shopify-belgium-discovered.json
 */

import { PlaywrightCrawler, Dataset } from 'crawlee';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ─── Configuration ───────────────────────────────────────────────
const OUTPUT_FILE = 'storage/shopify-belgium-discovered.json';
const MAX_PAGES_PER_DORK = 5; // pages de résultats par dork

// ─── Dorks ciblant les sites belges Shopify ──────────────────────
const DORKS = [
  // Signature technique directe
  'site:.be "powered by shopify"',
  'site:.be "myshopify.com"',
  'site:.be "shopify-checkout-api-token"',

  // TLD .be + indices e-commerce Shopify
  'site:.be inurl:/collections/',
  'site:.be inurl:/products/ "add to cart"',
  'site:.be "checkout.shopify.com"',

  // Variantes pays + langue
  '"powered by shopify" belgique livraison',
  '"powered by shopify" belgie levering',
  '"powered by shopify" belgium shipping site:.be',
  '"myshopify.com" site:.be -blog -article -review',

  // Niches courantes
  'site:.be "shopify" mode vêtements',
  'site:.be "shopify" bijoux accessoires',
  'site:.be "shopify" cosmétique beauté',
  'site:.be "shopify" décoration maison',
  'site:.be "shopify" alimentation bio',
];

// ─── Stockage des URLs découvertes ──────────────────────────────
const discoveredUrls = new Set<string>();

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Garder uniquement le domaine racine
    return `${u.protocol}//${u.hostname}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function isRelevantUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const dominated = u.hostname.toLowerCase();
    // Exclure les résultats non pertinents
    const excludes = [
      'duckduckgo.com', 'google.com', 'bing.com', 'yahoo.com',
      'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
      'linkedin.com', 'reddit.com', 'wikipedia.org', 'pinterest.com',
      'shopify.com', 'myshopify.com', 'apps.shopify.com',
      'builtwith.com', 'wappalyzer.com', 'similartech.com',
      'github.com', 'stackoverflow.com', 'medium.com',
    ];
    if (excludes.some(ex => dominated.includes(ex))) return false;
    // Priorité aux .be mais accepter aussi d'autres TLD belges
    return true;
  } catch {
    return false;
  }
}

// ─── Phase 1 : DuckDuckGo Scraping ──────────────────────────────
async function scrapeDuckDuckGo() {
  console.log('\n🔍 Phase 1 : DuckDuckGo Dorks\n');

  const dorkUrls = DORKS.map(dork => {
    const encoded = encodeURIComponent(dork);
    return {
      url: `https://duckduckgo.com/?q=${encoded}&ia=web`,
      userData: { dork },
    };
  });

  const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
      const dork = request.userData.dork as string;
      log.info(`Dork: ${dork}`);

      // Attendre les résultats
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Essayer de cliquer sur "More results" quelques fois
      for (let i = 0; i < MAX_PAGES_PER_DORK - 1; i++) {
        try {
          const moreBtn = page.locator('a.result--more__btn, button#more-results, a[id="more-results"]');
          if (await moreBtn.isVisible({ timeout: 3000 })) {
            await moreBtn.click();
            await page.waitForTimeout(2000);
          } else {
            break;
          }
        } catch {
          break;
        }
      }

      // Extraire les liens de résultats
      const links = await page.$$eval(
        'a.result__a, article a[data-testid="result-title-a"], a[href*="//uddg"]',
        els => els.map(el => (el as HTMLAnchorElement).href).filter(Boolean)
      );

      // Fallback : extraire tous les liens qui ressemblent à des résultats
      const allLinks = await page.$$eval('a[href]', els =>
        els.map(el => (el as HTMLAnchorElement).href)
          .filter(h => h && !h.includes('duckduckgo.com') && h.startsWith('http'))
      );

      const combined = [...new Set([...links, ...allLinks])];
      let count = 0;

      for (const link of combined) {
        // DuckDuckGo utilise des redirections uddg — extraire l'URL réelle
        let realUrl = link;
        try {
          const urlObj = new URL(link);
          const uddg = urlObj.searchParams.get('uddg');
          if (uddg) realUrl = uddg;
        } catch { /* keep original */ }

        if (isRelevantUrl(realUrl)) {
          const normalized = normalizeUrl(realUrl);
          if (!discoveredUrls.has(normalized)) {
            discoveredUrls.add(normalized);
            count++;
          }
        }
      }

      log.info(`  → ${count} nouvelles URLs (total: ${discoveredUrls.size})`);
    },

    maxRequestsPerCrawl: DORKS.length,
    maxConcurrency: 2, // pas trop agressif
    headless: true,
    navigationTimeoutSecs: 30,
    requestHandlerTimeoutSecs: 45,
    launchContext: {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
  });

  await crawler.run(dorkUrls);
  console.log(`\n✅ Phase 1 terminée : ${discoveredUrls.size} URLs uniques découvertes\n`);
}

// ─── Phase 2 : Certificate Transparency (crt.sh) ────────────────
async function scrapeCrtSh() {
  console.log('\n🔐 Phase 2 : Certificate Transparency (crt.sh)\n');

  // Rechercher les certificats pour des domaines .be liés à Shopify
  const queries = [
    '%.be',  // tous les .be avec wildcard (via shops.myshopify.com on peut trouver les custom domains)
  ];

  const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
      log.info(`crt.sh query: ${request.url}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Extraire les noms de domaines des certificats
      const domains = await page.$$eval('td', els => {
        return els
          .map(el => el.textContent?.trim() || '')
          .filter(t => t.includes('.be') && !t.includes(' '))
          .map(t => t.replace(/^\*\./, ''));
      });

      let count = 0;
      for (const domain of domains) {
        const normalized = `https://${domain}`.toLowerCase();
        if (!discoveredUrls.has(normalized) && domain.endsWith('.be')) {
          discoveredUrls.add(normalized);
          count++;
        }
      }

      log.info(`  → ${count} domaines .be trouvés`);
    },

    maxRequestsPerCrawl: 5,
    maxConcurrency: 1,
    headless: true,
    navigationTimeoutSecs: 60,
    requestHandlerTimeoutSecs: 90,
    launchContext: {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
  });

  // Chercher les certificats émis par Shopify pour des domaines .be
  // Shopify utilise Let's Encrypt et leurs propres certificats
  const crtUrls = [
    'https://crt.sh/?q=%25.myshopify.com&output=json',
  ];

  // Utilisation directe via fetch pour le JSON de crt.sh
  console.log('  Requête crt.sh pour les domaines myshopify.com...');
  try {
    const resp = await fetch('https://crt.sh/?q=%25.be&Identity=myshopify.com&output=json');
    if (resp.ok) {
      const certs = await resp.json() as Array<{ common_name: string; name_value: string }>;
      let count = 0;
      for (const cert of certs) {
        const names = (cert.name_value || '').split('\n');
        for (const name of names) {
          const clean = name.replace(/^\*\./, '').trim().toLowerCase();
          if (clean.endsWith('.be')) {
            const normalized = `https://${clean}`;
            if (!discoveredUrls.has(normalized)) {
              discoveredUrls.add(normalized);
              count++;
            }
          }
        }
      }
      console.log(`  → ${count} domaines .be via crt.sh`);
    }
  } catch (e) {
    console.log('  ⚠️ crt.sh timeout ou erreur, on continue...');
  }

  console.log(`\n✅ Phase 2 terminée : ${discoveredUrls.size} URLs total\n`);
}

// ─── Phase 3 : Scraper des annuaires de shops Shopify ────────────
async function scrapeDirectories() {
  console.log('\n📋 Phase 3 : Annuaires de boutiques Shopify\n');

  const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
      log.info(`Directory: ${request.url}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Extraire tous les liens externes
      const links = await page.$$eval('a[href]', els =>
        els.map(el => (el as HTMLAnchorElement).href)
          .filter(h => h && h.startsWith('http'))
      );

      let count = 0;
      for (const link of links) {
        try {
          const u = new URL(link);
          if (u.hostname.endsWith('.be') && isRelevantUrl(link)) {
            const normalized = normalizeUrl(link);
            if (!discoveredUrls.has(normalized)) {
              discoveredUrls.add(normalized);
              count++;
            }
          }
        } catch { /* skip */ }
      }

      log.info(`  → ${count} nouvelles URLs .be`);
    },

    maxRequestsPerCrawl: 20,
    maxConcurrency: 2,
    headless: true,
    navigationTimeoutSecs: 30,
    launchContext: {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
  });

  // Annuaires connus de shops Shopify
  const directoryUrls = [
    'https://www.shopistores.com/country/belgium',
    'https://www.myip.ms/browse/sites/1/ipID/23.227.38.0/ipIDlast/23.227.38.255',
  ];

  try {
    await crawler.run(directoryUrls);
  } catch (e) {
    console.log('  ⚠️ Certains annuaires inaccessibles, on continue...');
  }

  console.log(`\n✅ Phase 3 terminée : ${discoveredUrls.size} URLs total\n`);
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🇧🇪 Shopify Belgium URL Discovery');
  console.log('═══════════════════════════════════\n');

  // Charger les URLs précédemment découvertes si elles existent
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      if (Array.isArray(existing)) {
        for (const entry of existing) {
          if (entry.url) discoveredUrls.add(entry.url);
        }
        console.log(`📂 ${discoveredUrls.size} URLs chargées depuis ${OUTPUT_FILE}\n`);
      }
    } catch { /* fresh start */ }
  }

  // Exécuter les 3 phases
  await scrapeDuckDuckGo();
  await scrapeCrtSh();
  await scrapeDirectories();

  // Sauvegarder les résultats
  const results = Array.from(discoveredUrls).map(url => ({
    url,
    domain: new URL(url).hostname,
    tld: new URL(url).hostname.split('.').pop(),
    discoveredAt: new Date().toISOString(),
    verified: false, // sera rempli par shopify-verify.ts
  }));

  // Trier : .be d'abord
  results.sort((a, b) => {
    if (a.tld === 'be' && b.tld !== 'be') return -1;
    if (a.tld !== 'be' && b.tld === 'be') return 1;
    return a.domain.localeCompare(b.domain);
  });

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n═══════════════════════════════════');
  console.log(`✅ ${results.length} URLs découvertes → ${OUTPUT_FILE}`);
  console.log(`   dont ${results.filter(r => r.tld === 'be').length} en .be`);
  console.log('\n👉 Prochaine étape : npx tsx scripts/shopify-verify.ts');
}

main().catch(console.error);

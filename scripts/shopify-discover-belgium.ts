/**
 * Shopify URL Discovery — Belgian Sites
 *
 * Sources utilisées :
 * 1. DuckDuckGo HTML dorks (site:.be + signatures Shopify)
 * 2. crt.sh (Certificate Transparency)
 * 3. Annuaires de shops Shopify
 *
 * Usage : npx tsx scripts/shopify-discover-belgium.ts
 * Output : storage/shopify-belgium-discovered.json
 */

import { CheerioCrawler, Dataset } from 'crawlee';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

// ─── Configuration ───────────────────────────────────────────────
const OUTPUT_FILE = 'storage/shopify-belgium-discovered.json';

// Assurer que le dossier storage existe
if (!existsSync('storage')) mkdirSync('storage');

// ─── Dorks ciblant les sites belges Shopify ──────────────────────
const DORKS = [
  'site:.be "powered by shopify"',
  'site:.be "myshopify.com"',
  'site:.be "shopify-checkout-api-token"',
  'site:.be inurl:/collections/ "add to cart"',
  'site:.be inurl:/products/ "add to cart"',
  'site:.be "checkout.shopify.com"',
  '"powered by shopify" belgique livraison',
  '"powered by shopify" belgie levering',
  '"powered by shopify" belgium shipping site:.be',
  '"myshopify.com" site:.be -blog -article -review',
  'site:.be "shopify" mode vêtements boutique',
  'site:.be "shopify" bijoux accessoires boutique',
  'site:.be "shopify" cosmétique beauté boutique',
  'site:.be "shopify" décoration maison boutique',
  'site:.be "shopify" alimentation bio boutique',
];

// ─── Stockage des URLs découvertes ──────────────────────────────
const discoveredUrls = new Map<string, { url: string; source: string }>();

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function isRelevantUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const excludes = [
      'duckduckgo.com', 'google.com', 'bing.com', 'yahoo.com',
      'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
      'linkedin.com', 'reddit.com', 'wikipedia.org', 'pinterest.com',
      'shopify.com', 'myshopify.com', 'apps.shopify.com',
      'builtwith.com', 'wappalyzer.com', 'similartech.com',
      'github.com', 'stackoverflow.com', 'medium.com',
      'trustpilot.com', 'yelp.com', 'tripadvisor.com',
    ];
    return !excludes.some(ex => host.includes(ex));
  } catch {
    return false;
  }
}

function addUrl(url: string, source: string) {
  if (!isRelevantUrl(url)) return;
  const normalized = normalizeUrl(url);
  if (!discoveredUrls.has(normalized)) {
    discoveredUrls.set(normalized, { url: normalized, source });
  }
}

// ─── Phase 1 : DuckDuckGo HTML Scraping ─────────────────────────
async function scrapeDuckDuckGo() {
  console.log('\n🔍 Phase 1 : DuckDuckGo Dorks\n');

  const dorkRequests = DORKS.map(dork => ({
    url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(dork)}`,
    userData: { dork, source: 'duckduckgo' },
  }));

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log }) {
      const dork = request.userData.dork as string;
      let count = 0;

      // DuckDuckGo HTML version — liens dans .result__a
      $('a.result__a').each((_, el) => {
        const href = $(el).attr('href') || '';
        // DuckDuckGo wraps URLs in //duckduckgo.com/l/?uddg=...
        let realUrl = href;
        try {
          if (href.includes('uddg=')) {
            const params = new URL(href, 'https://duckduckgo.com').searchParams;
            realUrl = params.get('uddg') || href;
          }
        } catch { /* keep original */ }

        if (realUrl.startsWith('http')) {
          addUrl(realUrl, `dork:${dork}`);
          count++;
        }
      });

      // Fallback : tous les liens avec href http
      $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('http') && !href.includes('duckduckgo.com')) {
          addUrl(href, `dork:${dork}`);
        }
      });

      log.info(`[DDG] "${dork.slice(0, 50)}..." → ${count} résultats (total: ${discoveredUrls.size})`);
    },

    maxRequestsPerCrawl: DORKS.length,
    maxConcurrency: 2,
    navigationTimeoutSecs: 30,
    maxRequestRetries: 1,
  });

  await crawler.run(dorkRequests);
  console.log(`\n✅ Phase 1 terminée : ${discoveredUrls.size} URLs\n`);
}

// ─── Phase 2 : crt.sh (Certificate Transparency) ────────────────
async function scrapeCrtSh() {
  console.log('\n🔐 Phase 2 : Certificate Transparency (crt.sh)\n');

  // Shopify héberge les sites sur leurs serveurs et émet des certificats
  // On cherche les certificats liés à des domaines .be sur l'infra Shopify
  const crtQueries = [
    'https://crt.sh/?q=%25.myshopify.com&output=json',
  ];

  for (const queryUrl of crtQueries) {
    try {
      console.log('  Requête crt.sh...');
      const resp = await fetch(queryUrl, {
        signal: AbortSignal.timeout(30000),
      });
      if (!resp.ok) {
        console.log(`  ⚠️ crt.sh HTTP ${resp.status}`);
        continue;
      }
      const certs = await resp.json() as Array<{ common_name: string; name_value: string }>;
      let count = 0;
      for (const cert of certs) {
        const names = (cert.name_value || '').split('\n');
        for (const name of names) {
          const clean = name.replace(/^\*\./, '').trim().toLowerCase();
          if (clean.endsWith('.be') && clean.includes('.') && !clean.includes(' ')) {
            addUrl(`https://${clean}`, 'crt.sh');
            count++;
          }
        }
        // Aussi le common_name
        const cn = (cert.common_name || '').trim().toLowerCase();
        if (cn.endsWith('.be') && cn.includes('.') && !cn.includes(' ')) {
          addUrl(`https://${cn}`, 'crt.sh');
          count++;
        }
      }
      console.log(`  → ${count} entrées .be trouvées (total: ${discoveredUrls.size})`);
    } catch (e: any) {
      console.log(`  ⚠️ crt.sh erreur: ${e.message?.slice(0, 60)}`);
    }
  }

  console.log(`\n✅ Phase 2 terminée : ${discoveredUrls.size} URLs total\n`);
}

// ─── Phase 3 : Annuaires ────────────────────────────────────────
async function scrapeDirectories() {
  console.log('\n📋 Phase 3 : Annuaires de boutiques\n');

  const directoryRequests = [
    {
      url: 'https://www.shopistores.com/country/belgium',
      userData: { source: 'shopistores' },
    },
  ];

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log }) {
      let count = 0;

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        try {
          const u = new URL(href, request.url);
          if (u.hostname.endsWith('.be') && isRelevantUrl(u.href)) {
            addUrl(u.href, request.userData.source as string);
            count++;
          }
        } catch { /* skip */ }
      });

      log.info(`[DIR] ${request.url} → ${count} URLs .be (total: ${discoveredUrls.size})`);
    },

    maxRequestsPerCrawl: 10,
    maxConcurrency: 2,
    navigationTimeoutSecs: 30,
    maxRequestRetries: 1,
  });

  try {
    await crawler.run(directoryRequests);
  } catch {
    console.log('  ⚠️ Certains annuaires inaccessibles');
  }

  console.log(`\n✅ Phase 3 terminée : ${discoveredUrls.size} URLs total\n`);
}

// ─── Phase 4 : Bing (alternative à Google) ──────────────────────
async function scrapeBing() {
  console.log('\n🔎 Phase 4 : Bing Search\n');

  const bingDorks = [
    'site:.be "powered by shopify"',
    'site:.be "myshopify.com"',
    'site:.be "cdn.shopify.com" "add to cart"',
    'site:.be "checkout.shopify.com"',
  ];

  const bingRequests = bingDorks.map(dork => ({
    url: `https://www.bing.com/search?q=${encodeURIComponent(dork)}&count=50`,
    userData: { dork, source: 'bing' },
  }));

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log }) {
      const dork = request.userData.dork as string;
      let count = 0;

      // Bing result links
      $('li.b_algo a, .b_algo h2 a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('http')) {
          addUrl(href, `bing:${dork}`);
          count++;
        }
      });

      // Fallback
      $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('http') && !href.includes('bing.com') && !href.includes('microsoft.com')) {
          try {
            const u = new URL(href);
            if (u.hostname.endsWith('.be')) {
              addUrl(href, `bing:${dork}`);
            }
          } catch { /* skip */ }
        }
      });

      log.info(`[Bing] "${dork.slice(0, 50)}..." → ${count} résultats (total: ${discoveredUrls.size})`);
    },

    maxRequestsPerCrawl: bingDorks.length,
    maxConcurrency: 1,
    navigationTimeoutSecs: 30,
    maxRequestRetries: 1,
  });

  try {
    await crawler.run(bingRequests);
  } catch {
    console.log('  ⚠️ Bing inaccessible');
  }

  console.log(`\n✅ Phase 4 terminée : ${discoveredUrls.size} URLs total\n`);
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🇧🇪 Shopify Belgium URL Discovery');
  console.log('═══════════════════════════════════\n');

  // Charger les URLs précédemment découvertes
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      if (Array.isArray(existing)) {
        for (const entry of existing) {
          if (entry.url) discoveredUrls.set(entry.url, { url: entry.url, source: entry.source || 'previous' });
        }
        console.log(`📂 ${discoveredUrls.size} URLs chargées depuis ${OUTPUT_FILE}\n`);
      }
    } catch { /* fresh start */ }
  }

  await scrapeDuckDuckGo();
  await scrapeCrtSh();
  await scrapeDirectories();
  await scrapeBing();

  // Sauvegarder
  const results = Array.from(discoveredUrls.values()).map(({ url, source }) => {
    let domain = '';
    let tld = '';
    try {
      const u = new URL(url);
      domain = u.hostname;
      tld = u.hostname.split('.').pop() || '';
    } catch { /* skip */ }

    return {
      url,
      domain,
      tld,
      source,
      discoveredAt: new Date().toISOString(),
      verified: false,
    };
  });

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

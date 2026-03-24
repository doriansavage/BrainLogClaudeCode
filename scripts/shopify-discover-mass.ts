/**
 * Shopify Mass Discovery — Belgian Sites (Gratuit)
 *
 * Stratégies pour trouver des centaines de sites :
 * 1. DuckDuckGo dorks élargis (50+ requêtes : villes, secteurs, variantes)
 * 2. Bing dorks élargis
 * 3. crt.sh Certificate Transparency (myshopify.com subdomains → CNAME → domaines belges)
 * 4. myip.ms reverse IP lookup sur les ranges Shopify
 * 5. Annuaires multiples avec pagination
 * 6. DNS reverse lookup sur IPs Shopify pour domaines .be
 *
 * Usage : npx tsx scripts/shopify-discover-mass.ts
 * Output : storage/shopify-belgium-discovered.json (merge avec existant)
 */

import { CheerioCrawler } from 'crawlee';
import { writeFileSync, readFileSync, existsSync, mkdirSync, execSync } from 'fs';

// ─── Configuration ───────────────────────────────────────────────
const OUTPUT_FILE = 'storage/shopify-belgium-discovered.json';
if (!existsSync('storage')) mkdirSync('storage');

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

const EXCLUDES = [
  'duckduckgo.com', 'google.com', 'bing.com', 'yahoo.com',
  'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'reddit.com', 'wikipedia.org', 'pinterest.com',
  'shopify.com', 'myshopify.com', 'apps.shopify.com', 'themes.shopify.com',
  'builtwith.com', 'wappalyzer.com', 'similartech.com', 'w3techs.com',
  'github.com', 'stackoverflow.com', 'medium.com', 'wordpress.com',
  'trustpilot.com', 'yelp.com', 'tripadvisor.com', 'amazon.com',
  'etsy.com', 'ebay.com', 'aliexpress.com', 'tiktok.com',
];

function isRelevantUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return !EXCLUDES.some(ex => host.includes(ex));
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

// ─── Phase 1 : DuckDuckGo MASS Dorks ────────────────────────────
// Villes belges × secteurs × variantes de signature
const BELGIAN_CITIES = [
  'bruxelles', 'brussels', 'antwerp', 'anvers', 'antwerpen',
  'gent', 'gand', 'liège', 'liege', 'luik',
  'bruges', 'brugge', 'namur', 'leuven', 'louvain',
  'mons', 'charleroi', 'hasselt', 'mechelen', 'malines',
  'kortrijk', 'tournai', 'ostende', 'oostende', 'waterloo',
  'wavre', 'nivelles', 'arlon', 'verviers',
];

const SECTORS = [
  'mode', 'vêtements', 'fashion', 'clothing', 'kleding',
  'bijoux', 'jewelry', 'juwelen', 'accessoires',
  'beauté', 'cosmétique', 'beauty', 'skincare', 'parfum',
  'décoration', 'déco', 'maison', 'intérieur', 'home decor',
  'alimentation', 'food', 'bio', 'chocolat', 'bière', 'beer',
  'sport', 'fitness', 'outdoor', 'vélo', 'cycling',
  'enfant', 'bébé', 'baby', 'kids', 'jouets',
  'animaux', 'pets', 'chien', 'chat',
  'high-tech', 'électronique', 'gadgets', 'tech',
  'cadeaux', 'gifts', 'geschenken',
  'chaussures', 'shoes', 'schoenen',
  'sacs', 'bags', 'maroquinerie',
  'fleurs', 'plantes', 'flowers', 'bloemen',
  'art', 'artisanat', 'handmade', 'fait main',
  'bien-être', 'wellness', 'yoga',
  'papeterie', 'bureau', 'stationery',
];

function generateDorks(): string[] {
  const dorks: string[] = [];

  // ── Signatures Shopify basiques × .be
  const shopifySignatures = [
    '"powered by shopify"',
    '"cdn.shopify.com"',
    '"myshopify.com"',
    '"shopify-checkout-api-token"',
    '"checkout.shopify.com"',
    'inurl:/collections/ "add to cart"',
    'inurl:/products/ "add to cart"',
    '"Shopify.shop"',
    '"_shopify_y"',
  ];

  for (const sig of shopifySignatures) {
    dorks.push(`site:.be ${sig}`);
  }

  // ── Villes belges × Shopify
  for (const city of BELGIAN_CITIES.slice(0, 15)) {
    dorks.push(`"powered by shopify" ${city} boutique`);
    dorks.push(`site:.be "shopify" ${city}`);
  }

  // ── Secteurs × Shopify Belgique
  for (const sector of SECTORS.slice(0, 20)) {
    dorks.push(`site:.be "shopify" ${sector} boutique`);
  }

  // ── Variantes multilingues (FR/NL/EN)
  dorks.push(
    '"powered by shopify" belgique livraison',
    '"powered by shopify" belgie levering',
    '"powered by shopify" belgium shipping',
    '"powered by shopify" belgium delivery',
    '"propulsé par shopify" belgique',
    '"aangedreven door shopify" belgie',
    'site:.be "winkelwagen" "shopify"',
    'site:.be "panier" "shopify"',
    'site:.be "shopping cart" "shopify"',
    '"boutique en ligne" belgique shopify',
    '"webshop" belgie shopify',
    '"online shop" belgium shopify site:.be',
    'site:.be inurl:"/cart" "shopify"',
    'site:.be inurl:"/account/login" "shopify"',
    'site:.brussels "shopify"',
    'site:.vlaanderen "shopify"',
  );

  // ── Domaines belges alternatifs
  dorks.push(
    'site:.brussels "powered by shopify"',
    'site:.vlaanderen "powered by shopify"',
    'site:.eu "powered by shopify" belgique',
    'site:.eu "powered by shopify" belgium',
    'site:.eu "powered by shopify" belgie',
  );

  // Dédupliquer
  return [...new Set(dorks)];
}

async function scrapeDuckDuckGo() {
  const dorks = generateDorks();
  console.log(`\n🔍 Phase 1 : DuckDuckGo Dorks (${dorks.length} requêtes)\n`);

  const requests = dorks.map(dork => ({
    url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(dork)}`,
    userData: { dork, source: 'duckduckgo' },
  }));

  let completed = 0;

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log }) {
      const dork = request.userData.dork as string;
      let count = 0;

      $('a.result__a').each((_, el) => {
        const href = $(el).attr('href') || '';
        let realUrl = href;
        try {
          if (href.includes('uddg=')) {
            const params = new URL(href, 'https://duckduckgo.com').searchParams;
            realUrl = params.get('uddg') || href;
          }
        } catch { /* keep original */ }

        if (realUrl.startsWith('http')) {
          addUrl(realUrl, `ddg:${dork.slice(0, 40)}`);
          count++;
        }
      });

      // Fallback: all external links
      $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('http') && !href.includes('duckduckgo.com')) {
          addUrl(href, `ddg:${dork.slice(0, 40)}`);
        }
      });

      completed++;
      if (completed % 10 === 0 || count > 3) {
        log.info(`[DDG ${completed}/${dorks.length}] "${dork.slice(0, 45)}..." → ${count} (total: ${discoveredUrls.size})`);
      }
    },

    maxRequestsPerCrawl: dorks.length,
    maxConcurrency: 2, // DDG rate limits
    navigationTimeoutSecs: 30,
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 20,
  });

  await crawler.run(requests);
  console.log(`\n✅ Phase 1 : ${discoveredUrls.size} URLs après DuckDuckGo\n`);
}

// ─── Phase 2 : Bing Mass Dorks ──────────────────────────────────
async function scrapeBing() {
  console.log('\n🔎 Phase 2 : Bing Search\n');

  const bingDorks = [
    'site:.be "powered by shopify"',
    'site:.be "myshopify.com"',
    'site:.be "cdn.shopify.com" "add to cart"',
    'site:.be "checkout.shopify.com"',
    'site:.be "shopify-checkout-api-token"',
    'site:.be inurl:/collections shopify',
    'site:.be inurl:/products shopify',
    '"powered by shopify" belgique',
    '"powered by shopify" belgium',
    '"powered by shopify" belgie',
    'site:.be "Shopify.shop"',
    'site:.brussels "powered by shopify"',
    'site:.be "winkelwagen" shopify',
    'site:.be boutique shopify mode',
    'site:.be boutique shopify bijoux',
    'site:.be boutique shopify beauté',
    'site:.be webshop shopify',
  ];

  // Bing supports multiple pages: first=1, first=11, first=21...
  const requests: Array<{ url: string; userData: Record<string, unknown> }> = [];
  for (const dork of bingDorks) {
    // First 3 pages per dork
    for (const first of [1, 11, 21]) {
      requests.push({
        url: `https://www.bing.com/search?q=${encodeURIComponent(dork)}&count=10&first=${first}`,
        userData: { dork, source: 'bing' },
      });
    }
  }

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log }) {
      let count = 0;

      $('li.b_algo a, .b_algo h2 a, .b_title a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('http')) {
          addUrl(href, `bing`);
          count++;
        }
      });

      // Broader fallback for .be links
      $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (!href.includes('bing.com') && !href.includes('microsoft.com')) {
          try {
            const u = new URL(href);
            if (u.hostname.endsWith('.be') || u.hostname.endsWith('.brussels') || u.hostname.endsWith('.vlaanderen')) {
              addUrl(href, 'bing');
            }
          } catch { /* skip */ }
        }
      });
    },

    maxRequestsPerCrawl: requests.length,
    maxConcurrency: 2,
    navigationTimeoutSecs: 30,
    maxRequestRetries: 1,
  });

  try {
    await crawler.run(requests);
  } catch {
    console.log('  ⚠️ Bing partiellement inaccessible');
  }

  console.log(`\n✅ Phase 2 : ${discoveredUrls.size} URLs après Bing\n`);
}

// ─── Phase 3 : crt.sh Certificate Transparency ─────────────────
async function scrapeCrtSh() {
  console.log('\n🔐 Phase 3 : Certificate Transparency (crt.sh)\n');

  // Query for myshopify.com subdomains — these are Shopify store handles
  // We collect them, then try to resolve their custom domains
  const myshopifyHandles: string[] = [];

  try {
    console.log('  Requête crt.sh pour *.myshopify.com...');
    const resp = await fetch('https://crt.sh/?q=%25.myshopify.com&output=json', {
      signal: AbortSignal.timeout(60000),
    });

    if (resp.ok) {
      const certs = (await resp.json()) as Array<{ common_name: string; name_value: string }>;
      console.log(`  ${certs.length} certificats trouvés`);

      const domains = new Set<string>();

      for (const cert of certs) {
        // Extraire tous les domaines des certificats
        const allNames = [
          cert.common_name || '',
          ...(cert.name_value || '').split('\n'),
        ];

        for (const name of allNames) {
          const clean = name.replace(/^\*\./, '').trim().toLowerCase();
          if (!clean || clean.includes(' ')) continue;

          // .be domains directement
          if (clean.endsWith('.be') || clean.endsWith('.brussels') || clean.endsWith('.vlaanderen')) {
            addUrl(`https://${clean}`, 'crt.sh');
          }

          // Collecter les handles myshopify.com
          if (clean.endsWith('.myshopify.com')) {
            const handle = clean.replace('.myshopify.com', '');
            if (handle && !handle.includes('.') && !handle.includes('*')) {
              domains.add(handle);
            }
          }
        }
      }

      // Filtrer les handles qui contiennent des mots belges
      const belgianKeywords = [
        'belg', 'brux', 'brussel', 'antwerp', 'gent', 'gand', 'liege', 'luik',
        'bruges', 'brugge', 'namur', 'leuven', 'louvain', 'charleroi', 'mons',
        'hasselt', 'mechel', 'maline', 'kortrijk', 'tournai', 'ostend', 'waterloo',
        'wavre', 'nivelle', 'arlon', 'vervier', 'vlaanderen', 'walloni', 'flandre',
        '-be', 'belgium', 'belgique', 'belgie',
      ];

      for (const handle of domains) {
        if (belgianKeywords.some(kw => handle.includes(kw))) {
          myshopifyHandles.push(handle);
          // Essayer le domaine custom probable (.be)
          const baseName = handle
            .replace(/-be$/, '')
            .replace(/-belgium$/, '')
            .replace(/-belgique$/, '')
            .replace(/-belgie$/, '')
            .replace(/-/g, '');
          addUrl(`https://${baseName}.be`, 'crt.sh:handle-guess');
        }
      }

      console.log(`  ${myshopifyHandles.length} handles belges trouvés parmi ${domains.size} shops`);
    } else {
      console.log(`  ⚠️ crt.sh HTTP ${resp.status}`);
    }
  } catch (e: any) {
    console.log(`  ⚠️ crt.sh erreur: ${e.message?.slice(0, 60)}`);
  }

  // Aussi chercher directement les certificats .be liés à Shopify
  const belDomainQueries = [
    'https://crt.sh/?q=%25.be&output=json',
  ];

  // Note: cette requête est souvent trop large — on la skip si crt.sh est lent
  // On se concentre sur les handles myshopify

  console.log(`\n✅ Phase 3 : ${discoveredUrls.size} URLs après crt.sh\n`);
}

// ─── Phase 4 : Reverse DNS sur IPs Shopify ──────────────────────
async function reverseDnsShopify() {
  console.log('\n🌐 Phase 4 : Reverse DNS sur IPs Shopify\n');

  // Shopify primary IP ranges
  const shopifyIPs = [
    '23.227.38', '23.227.39',
    '104.154.88', '104.154.89',
  ];

  let found = 0;

  for (const prefix of shopifyIPs) {
    console.log(`  Scanning ${prefix}.0/24...`);
    // Use dig or host for reverse DNS
    for (let i = 1; i <= 254; i++) {
      const ip = `${prefix}.${i}`;
      try {
        const result = execSync(`dig +short -x ${ip} 2>/dev/null || true`, {
          timeout: 3000,
          encoding: 'utf-8',
        }).trim();

        if (result) {
          const domains = result.split('\n');
          for (const domain of domains) {
            const clean = domain.replace(/\.$/, '').trim().toLowerCase();
            if (
              clean.endsWith('.be') ||
              clean.endsWith('.brussels') ||
              clean.endsWith('.vlaanderen')
            ) {
              addUrl(`https://${clean}`, 'reverse-dns');
              found++;
              console.log(`    ✅ ${ip} → ${clean}`);
            }
          }
        }
      } catch {
        // timeout or no result, continue
      }
    }
  }

  console.log(`\n✅ Phase 4 : ${found} domaines belges trouvés par reverse DNS (total: ${discoveredUrls.size})\n`);
}

// ─── Phase 5 : Annuaires et listes publiques ────────────────────
async function scrapeDirectories() {
  console.log('\n📋 Phase 5 : Annuaires et listes publiques\n');

  const directoryUrls = [
    // Shopistores - Belgium (multiple pages)
    'https://www.shopistores.com/country/belgium',
    'https://www.shopistores.com/country/belgium?page=2',
    'https://www.shopistores.com/country/belgium?page=3',
    'https://www.shopistores.com/country/belgium?page=4',
    'https://www.shopistores.com/country/belgium?page=5',
    // myip.ms — sites hébergés sur les IPs Shopify
    'https://myip.ms/browse/sites/1/ipID/23.227.38.32/ipIDlast/23.227.38.63/sort/6/asc/1',
    'https://myip.ms/browse/sites/1/ipID/23.227.38.64/ipIDlast/23.227.38.95/sort/6/asc/1',
    'https://myip.ms/browse/sites/1/ipID/23.227.38.0/ipIDlast/23.227.38.31/sort/6/asc/1',
    'https://myip.ms/browse/sites/1/ipID/23.227.39.0/ipIDlast/23.227.39.255/sort/6/asc/1',
    // Store Leads free listings
    'https://storeleads.app/reports/shopify/BE',
  ];

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request, log }) {
      let count = 0;
      const source = request.url.includes('shopistores') ? 'shopistores'
        : request.url.includes('myip.ms') ? 'myip.ms'
        : request.url.includes('storeleads') ? 'storeleads'
        : 'directory';

      // Extraire tous les liens vers des domaines .be
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        try {
          const u = new URL(href, request.url);
          const host = u.hostname.toLowerCase();
          if (
            (host.endsWith('.be') || host.endsWith('.brussels') || host.endsWith('.vlaanderen') || host.endsWith('.eu')) &&
            isRelevantUrl(u.href)
          ) {
            addUrl(u.href, source);
            count++;
          }
        } catch { /* skip */ }
      });

      // Pour myip.ms — les domaines sont souvent dans des <td> ou du texte
      if (source === 'myip.ms') {
        const text = $('body').text();
        const domainRegex = /([a-z0-9][-a-z0-9]*\.(?:be|brussels|vlaanderen))\b/gi;
        let match;
        while ((match = domainRegex.exec(text)) !== null) {
          addUrl(`https://${match[1].toLowerCase()}`, 'myip.ms');
          count++;
        }
      }

      // Pour storeleads — domaines dans le contenu
      if (source === 'storeleads') {
        const text = $('body').text();
        const domainRegex = /([a-z0-9][-a-z0-9]*\.(?:be|brussels|vlaanderen|com|eu|shop))\b/gi;
        let match;
        while ((match = domainRegex.exec(text)) !== null) {
          const domain = match[1].toLowerCase();
          if (isRelevantUrl(`https://${domain}`)) {
            addUrl(`https://${domain}`, 'storeleads');
            count++;
          }
        }
      }

      log.info(`[DIR] ${request.url.slice(0, 60)} → ${count} URLs (total: ${discoveredUrls.size})`);
    },

    async failedRequestHandler({ request, log }) {
      log.info(`[DIR] ⚠️ ${request.url.slice(0, 60)} — failed`);
    },

    maxRequestsPerCrawl: directoryUrls.length,
    maxConcurrency: 2,
    navigationTimeoutSecs: 30,
    maxRequestRetries: 1,
  });

  try {
    await crawler.run(directoryUrls.map(url => ({ url, userData: {} })));
  } catch {
    console.log('  ⚠️ Certains annuaires inaccessibles');
  }

  console.log(`\n✅ Phase 5 : ${discoveredUrls.size} URLs après annuaires\n`);
}

// ─── Phase 6 : Shopify Handles → Custom domains via DNS ─────────
async function resolveShopifyHandles() {
  console.log('\n🔗 Phase 6 : Résolution DNS de domaines candidats\n');

  // Collecter les domaines .be qu'on a trouvés et vérifier qu'ils pointent bien quelque part
  const beUrls = Array.from(discoveredUrls.values())
    .filter(e => {
      try { return new URL(e.url).hostname.endsWith('.be'); } catch { return false; }
    });

  // Aussi essayer des variantes de noms
  // Prendre les handles myshopify trouvés et tenter domainName.be
  console.log(`  ${beUrls.length} domaines .be à vérifier\n`);

  let resolved = 0;
  let failed = 0;

  for (const entry of beUrls) {
    try {
      const hostname = new URL(entry.url).hostname;
      const result = execSync(`dig +short ${hostname} 2>/dev/null || true`, {
        timeout: 3000,
        encoding: 'utf-8',
      }).trim();

      if (result) {
        resolved++;
      } else {
        // Domaine ne résout pas — le retirer
        discoveredUrls.delete(entry.url);
        failed++;
      }
    } catch {
      // DNS timeout
    }
  }

  console.log(`  ✅ ${resolved} domaines résolvent, ${failed} retirés\n`);
  console.log(`\n✅ Phase 6 : ${discoveredUrls.size} URLs après validation DNS\n`);
}

// ─── Phase 7 : DuckDuckGo pages 2+ ─────────────────────────────
async function scrapeDDGPage2() {
  console.log('\n🔍 Phase 7 : DuckDuckGo page 2 (requêtes les plus prometteuses)\n');

  // DDG HTML pagination uses &s=30 for next page offset, &dc=31
  const topDorks = [
    'site:.be "powered by shopify"',
    'site:.be "cdn.shopify.com"',
    'site:.be "myshopify.com"',
    '"powered by shopify" belgique',
    '"powered by shopify" belgium',
    '"powered by shopify" belgie',
    'site:.be shopify boutique en ligne',
    'site:.be shopify webshop',
    'site:.be "add to cart" shopify',
    'site:.be inurl:/collections/ shopify',
  ];

  const requests = topDorks.flatMap(dork => [
    {
      url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(dork)}&s=30&dc=31`,
      userData: { dork, source: 'ddg-p2' },
    },
    {
      url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(dork)}&s=60&dc=61`,
      userData: { dork, source: 'ddg-p3' },
    },
  ]);

  const crawler = new CheerioCrawler({
    async requestHandler({ $, request }) {
      $('a.result__a').each((_, el) => {
        const href = $(el).attr('href') || '';
        let realUrl = href;
        try {
          if (href.includes('uddg=')) {
            const params = new URL(href, 'https://duckduckgo.com').searchParams;
            realUrl = params.get('uddg') || href;
          }
        } catch { /* keep */ }
        if (realUrl.startsWith('http')) {
          addUrl(realUrl, request.userData.source as string);
        }
      });

      $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('http') && !href.includes('duckduckgo.com')) {
          addUrl(href, request.userData.source as string);
        }
      });
    },

    maxRequestsPerCrawl: requests.length,
    maxConcurrency: 1, // Gentle on DDG
    navigationTimeoutSecs: 30,
    maxRequestRetries: 0,
  });

  try {
    await crawler.run(requests);
  } catch {
    console.log('  ⚠️ DDG pagination partiellement inaccessible');
  }

  console.log(`\n✅ Phase 7 : ${discoveredUrls.size} URLs après DDG pagination\n`);
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🇧🇪 Shopify Belgium MASS Discovery');
  console.log('════════════════════════════════════\n');

  // Charger existant
  if (existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      if (Array.isArray(existing)) {
        for (const entry of existing) {
          if (entry.url) discoveredUrls.set(entry.url, { url: entry.url, source: entry.source || 'previous' });
        }
        console.log(`📂 ${discoveredUrls.size} URLs chargées (existantes)\n`);
      }
    } catch { /* fresh start */ }
  }

  const startCount = discoveredUrls.size;

  // Exécuter toutes les phases
  await scrapeDuckDuckGo();
  await scrapeBing();
  await scrapeCrtSh();

  // Reverse DNS peut être lent — on le fait seulement si dig est disponible
  try {
    execSync('which dig', { encoding: 'utf-8' });
    await reverseDnsShopify();
  } catch {
    console.log('\n⏭️  dig non disponible, skip reverse DNS\n');
  }

  await scrapeDirectories();
  await scrapeDDGPage2();

  // Phase 6 : Valider les DNS des domaines .be trouvés
  try {
    execSync('which dig', { encoding: 'utf-8' });
    await resolveShopifyHandles();
  } catch {
    console.log('\n⏭️  dig non disponible, skip validation DNS\n');
  }

  // ── Sauvegarder ──
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

  // Trier : .be d'abord, puis .brussels, puis .eu, puis reste
  const tldPriority: Record<string, number> = { be: 0, brussels: 1, vlaanderen: 2, eu: 3 };
  results.sort((a, b) => {
    const pa = tldPriority[a.tld] ?? 99;
    const pb = tldPriority[b.tld] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.domain.localeCompare(b.domain);
  });

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  // ── Stats ──
  const newCount = discoveredUrls.size - startCount;
  const tldStats: Record<string, number> = {};
  for (const r of results) {
    tldStats[r.tld] = (tldStats[r.tld] || 0) + 1;
  }
  const sourceStats: Record<string, number> = {};
  for (const r of results) {
    const src = r.source.split(':')[0];
    sourceStats[src] = (sourceStats[src] || 0) + 1;
  }

  console.log('\n════════════════════════════════════');
  console.log(`📊 Résultats Mass Discovery`);
  console.log(`   Total URLs     : ${results.length} (+${newCount} nouvelles)`);
  console.log(`   Par TLD        : ${Object.entries(tldStats).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  console.log(`   Par source     : ${Object.entries(sourceStats).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  console.log(`\n📁 Output : ${OUTPUT_FILE}`);
  console.log(`\n👉 Prochaine étape : npx tsx scripts/shopify-verify.ts`);
}

main().catch(console.error);

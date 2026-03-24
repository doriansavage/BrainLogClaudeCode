/**
 * Compile all discovered Shopify Belgium URLs from multiple sources
 * into storage/shopify-belgium-discovered.json
 *
 * Sources: storeleads, sellercenter, eachspy, bootleads, cartinsight, websearch
 *
 * Usage: npx tsx scripts/shopify-compile-discovered.ts
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const OUTPUT_FILE = 'storage/shopify-belgium-discovered.json';
if (!existsSync('storage')) mkdirSync('storage');

// ─── All discovered domains with sources ─────────────────────────

const DISCOVERED: Record<string, string> = {
  // === storeleads top stores ===
  'ice-watch.com': 'storeleads',
  'driesvannoten.com': 'storeleads',
  'loopearplugs.com': 'storeleads',
  'dragondiffusion.com': 'storeleads',
  'bellerose.com': 'storeleads',

  // === sellercenter top 100 Belgium ===
  'onyxcookware.be': 'sellercenter',
  'berghoff-belgium.be': 'sellercenter',
  'omidcarpets.be': 'sellercenter',
  'arte-antwerp.com': 'sellercenter',
  'magicgorilla.io': 'sellercenter',
  'sissymarket.com': 'sellercenter',
  'store.tomorrowland.com': 'sellercenter',
  'amazonias.net': 'sellercenter',
  'shop-fr.attentia.be': 'sellercenter',
  'gimber.com': 'sellercenter',
  'auk.eco': 'sellercenter',
  'myluminette.com': 'sellercenter',
  'klafoutis.com': 'sellercenter',
  'serax.com': 'sellercenter',
  'fit-superhumain.com': 'sellercenter',
  'dierendonck.be': 'sellercenter',
  'pouches.eu': 'sellercenter',
  'shop.graspop.be': 'sellercenter',
  'finesmile.eu': 'sellercenter',
  'shop.hethaakbeest.be': 'sellercenter',
  'al-imen.com': 'sellercenter',
  'anziyya.com': 'sellercenter',
  'ellemillashop.com': 'sellercenter',
  'osakaworld.com': 'sellercenter',
  'shop.komono.com': 'sellercenter',
  'godiva.eu': 'sellercenter',
  'shop.aveve.be': 'sellercenter',
  'mcalson.com': 'sellercenter',
  'nattou.eu': 'sellercenter',
  'kleirantwerp.be': 'sellercenter',
  'degeleflamingo.com': 'sellercenter',
  'lup.be': 'sellercenter',
  'rainpharma.com': 'sellercenter',
  'copackr.com': 'sellercenter',
  'dogsuppy.com': 'sellercenter',
  'luna-concept-store.com': 'sellercenter',
  'petitbonbon.be': 'sellercenter',
  'foudebassin.com': 'sellercenter',
  'parlor.coffee': 'sellercenter',
  'shop.clubbrugge.be': 'sellercenter',
  'dunkrecords.com': 'sellercenter',
  'pharmabox.be': 'sellercenter',
  'guudwoman.com': 'sellercenter',
  'atelierjupe.com': 'sellercenter',
  'parfumsamples.be': 'sellercenter',
  'wideawake.coffee': 'sellercenter',
  'thefabricsales.com': 'sellercenter',
  'liquidesconfidentiels.com': 'sellercenter',
  'skinnylove.be': 'sellercenter',
  'extremeskateshop.be': 'sellercenter',
  'turtlecereals.com': 'sellercenter',
  'valleyoftea.com': 'sellercenter',
  'lecomte-alpirando.be': 'sellercenter',
  'postermansion.com': 'sellercenter',
  'saryna.be': 'sellercenter',
  'cestdujoly.be': 'sellercenter',
  'morrison.be': 'sellercenter',
  'pronti.be': 'sellercenter',
  'shop.libelle.be': 'sellercenter',
  'buddybuddy.co': 'sellercenter',
  'paperpigeon.be': 'sellercenter',
  'angelo.be': 'sellercenter',
  'paintingthepast.com': 'sellercenter',
  'axess.be': 'sellercenter',
  'zapmama.com': 'sellercenter',
  'theothershop.be': 'sellercenter',
  'gimmyvitamins.com': 'sellercenter',
  'diamond-world.shop': 'sellercenter',
  'rymbu.com': 'sellercenter',
  'salvun.com': 'sellercenter',
  'studioloco.eu': 'sellercenter',
  '4gold.eu': 'sellercenter',
  'bambaw-zerowaste.myshopify.com': 'sellercenter',
  'madtec.myshopify.com': 'sellercenter',

  // === bootleads ===
  'eclire.com': 'bootleads',
  'goedwinkel.com': 'bootleads',
  'el-creations.net': 'bootleads',
  'pollinasclothes.be': 'bootleads',
  'vestiri.nl': 'bootleads',
  'ozrashop.com': 'bootleads',
  'carobhandmade.be': 'bootleads',
  'boutiquebyjlk.be': 'bootleads',
  'nerundo.be': 'bootleads',
  'dezuttermode.com': 'bootleads',
  'planetb.care': 'bootleads',
  'elvor-antwerpen.com': 'bootleads',
  'styliz.be': 'bootleads',
  'shopblemia.store': 'bootleads',
  'yezni.com': 'bootleads',
  'getthinkit.com': 'bootleads',
  'pootr.eu': 'bootleads',
  'dakidani.com': 'bootleads',
  'mysteryoki.com': 'bootleads',
  'smartgiftpick.com': 'bootleads',
  'rent4event.be': 'bootleads',

  // === eachspy ===
  'kaartmarkt.be': 'eachspy',
  'geccashop.com': 'eachspy',
  'herbalstorebe.com': 'eachspy',
  'bovicci.com': 'eachspy',
  'batteryservicelimburg.be': 'eachspy',
  'sciencejewelry1824.shop': 'eachspy',
  'joesgroomingworld.com': 'eachspy',
  'nailscosmetics.be': 'eachspy',
  'ombrederos.com': 'eachspy',
  'kumocarbon.com': 'eachspy',
  'babyscloset.be': 'eachspy',
  'unikq.be': 'eachspy',
  'expecteddisappointment.com': 'eachspy',
  'starttoart.be': 'eachspy',
  'walkerandhunt.eu': 'eachspy',
  'arventoshop.com': 'eachspy',
  'strikegames.shop': 'eachspy',
  'be.svr.com': 'eachspy',

  // === storeleads city (Antwerp, Brussels) ===
  'ressencewatches.com': 'storeleads:antwerp',
  'idyl.com': 'storeleads:antwerp',
  'cowboy.com': 'storeleads:brussels',
  'theskateroom.com': 'storeleads:brussels',

  // === myshopify handles (Belgian) ===
  'belgique-boutique.myshopify.com': 'myshopify-search',
  'creativebelgium.myshopify.com': 'myshopify-search',
  'yess-belgium.myshopify.com': 'myshopify-search',

  // === websearch / other ===
  'myshoppy.be': 'websearch',
  'flipthebird.be': 'websearch',

  // === Manually known Belgian Shopify stores ===
  'komono.com': 'known-belgian',
  'wouters-hendrix.com': 'known-belgian',
  'essentiel-antwerp.com': 'known-belgian',
  'maje.com': 'known-belgian',
  'kassl-editions.com': 'known-belgian',
  'closed.com': 'known-belgian',
  'xandres.com': 'known-belgian',
  'mer-du-nord.com': 'known-belgian',
  'scapa.com': 'known-belgian',
  'jbc.be': 'known-belgian',
  'e5.be': 'known-belgian',
  'veritas.be': 'known-belgian',
  'juttu.be': 'known-belgian',
  'supergoods.be': 'known-belgian',
  'honest-by.com': 'known-belgian',
  'depuntwinkel.be': 'known-belgian',
  'tfrancq.com': 'known-belgian',
  'mayerline.be': 'known-belgian',
  'libelle-lekker.be': 'known-belgian',
  'bel-bo.be': 'known-belgian',
  'natan.be': 'known-belgian',
  'lies-mertens.com': 'known-belgian',
  'delvaux.com': 'known-belgian',
  'aboutariane.com': 'known-belgian',
  'mrcollection.be': 'known-belgian',
  'cks-fashion.com': 'known-belgian',
  'labellov.com': 'known-belgian',
  'scotch-soda.com': 'known-belgian',
  'kipling.com': 'known-belgian',
  'samsonite.be': 'known-belgian',
  'hedgren.com': 'known-belgian',
  'stanley1913.com': 'known-belgian',
  'rituals.com': 'known-belgian',
  'bioderma.be': 'known-belgian',
  'kruidvat.be': 'known-belgian',
  'farmaline.be': 'known-belgian',
  'colora.be': 'known-belgian',
  'leenbakker.be': 'known-belgian',
  'torfs.be': 'known-belgian',
  'zeb.be': 'known-belgian',
  'brantano.be': 'known-belgian',
  'juttu.be': 'known-belgian',
  'unigro.be': 'known-belgian',
  'bifrosti.com': 'known-belgian',
  'mykralli.be': 'known-belgian',
  'shopmagazijn.be': 'known-belgian',
  'carlofelice.be': 'known-belgian',
  'lamaison-bruxelles.com': 'known-belgian',
  'verantibody.com': 'known-belgian',
  'leonidas.com': 'known-belgian',
  'neuhaus.be': 'known-belgian',
  'pierremarcolini.com': 'known-belgian',
  'befrenchie.be': 'known-belgian',
  'sfratellibelgium.com': 'known-belgian',
  'tfrancq.com': 'known-belgian',
  'sportdirect.be': 'known-belgian',
  'belgianshop.com': 'known-belgian',
  'bringme.com': 'known-belgian',
  'smets.lu': 'known-belgian',
  'ixina.be': 'known-belgian',
  'ego.be': 'known-belgian',
  'prik-tik.be': 'known-belgian',
  'dothegreen.be': 'known-belgian',
  'edgardcooper.com': 'known-belgian',
  'youjuice.be': 'known-belgian',
  'travelight.be': 'known-belgian',
  'oysterfood.be': 'known-belgian',
};

// ─── Merge with existing data ────────────────────────────────────

interface DiscoveredEntry {
  url: string;
  domain: string;
  tld: string;
  source: string;
  discoveredAt: string;
  verified: boolean;
}

const existingMap = new Map<string, DiscoveredEntry>();

if (existsSync(OUTPUT_FILE)) {
  try {
    const existing: DiscoveredEntry[] = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
    for (const entry of existing) {
      existingMap.set(entry.domain, entry);
    }
    console.log(`📂 ${existingMap.size} entrées existantes chargées`);
  } catch { /* fresh start */ }
}

// Add new entries
let newCount = 0;
for (const [rawDomain, source] of Object.entries(DISCOVERED)) {
  // Normalize domain
  const domain = rawDomain.replace(/^www\./, '').toLowerCase();

  if (existingMap.has(domain) || existingMap.has(`www.${domain}`)) continue;

  const tld = domain.split('.').pop() || '';
  const url = `https://${domain}`;

  existingMap.set(domain, {
    url,
    domain,
    tld,
    source,
    discoveredAt: new Date().toISOString(),
    verified: false,
  });
  newCount++;
}

// Sort: .be first, then .brussels, .eu, then rest
const tldPriority: Record<string, number> = { be: 0, brussels: 1, vlaanderen: 2, eu: 3 };
const results = Array.from(existingMap.values()).sort((a, b) => {
  const pa = tldPriority[a.tld] ?? 99;
  const pb = tldPriority[b.tld] ?? 99;
  if (pa !== pb) return pa - pb;
  return a.domain.localeCompare(b.domain);
});

writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

// Stats
const tldStats: Record<string, number> = {};
for (const r of results) {
  tldStats[r.tld] = (tldStats[r.tld] || 0) + 1;
}
const sourceStats: Record<string, number> = {};
for (const r of results) {
  const src = r.source.split(':')[0];
  sourceStats[src] = (sourceStats[src] || 0) + 1;
}

console.log(`\n🇧🇪 Shopify Belgium Discovery — Compilation`);
console.log(`═══════════════════════════════════════════`);
console.log(`   Total URLs     : ${results.length} (+${newCount} nouvelles)`);
console.log(`   Par TLD        : ${Object.entries(tldStats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `.${k}=${v}`).join(', ')}`);
console.log(`   Par source     : ${Object.entries(sourceStats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(', ')}`);
console.log(`\n📁 Output : ${OUTPUT_FILE}`);
console.log(`\n👉 Prochaine étape : npx tsx scripts/shopify-verify.ts`);

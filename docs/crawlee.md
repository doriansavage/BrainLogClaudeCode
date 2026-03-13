# Crawlee — Documentation du projet BrainLogClaudeCode

> Crawlee est la bibliothèque utilisée dans ce projet pour **scraper et crawler des pages web externes** : sites de fournisseurs logistiques, concurrents, portails de tarifs, formulaires publics, etc.
> Documentation officielle : https://crawlee.dev/js

---

## Installation

```bash
npm install crawlee playwright
npx playwright install chromium
```

---

## Les 3 types de crawlers

| Crawler | Usage | Rendu JS |
|---|---|---|
| `CheerioCrawler` | HTML statique, ultra-rapide | ❌ |
| `PlaywrightCrawler` | Apps React/Vue/Angular, SPAs | ✅ |
| `PuppeteerCrawler` | Alternative à Playwright | ✅ |

**Dans ce projet : on utilise `PlaywrightCrawler`** (le site brain-log.com est une app JS).

---

## Structure de base

```ts
import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
  async requestHandler({ page, request, enqueueLinks, log }) {
    // page     → instance Playwright (accès DOM, interactions)
    // request  → { url, userData, ... }
    // enqueueLinks → ajouter des URLs à la queue
    // log      → logger interne Crawlee

    await page.waitForLoadState('networkidle'); // attendre le JS

    const data = await page.$eval('h1', el => el.textContent);
    await Dataset.pushData({ url: request.url, data });
  },

  maxRequestsPerCrawl: 50,
  headless: true,
});

await crawler.run(['https://example.com']);
```

---

## Options PlaywrightCrawler

### Options principales

| Option | Type | Description |
|---|---|---|
| `maxRequestsPerCrawl` | `number` | Limite totale de pages visitées |
| `maxConcurrency` | `number` | Nombre de pages en parallèle (défaut: 5) |
| `headless` | `boolean` | Mode sans interface (défaut: true) |
| `navigationTimeoutSecs` | `number` | Timeout navigation (défaut: 60s) |
| `requestHandlerTimeoutSecs` | `number` | Timeout handler (défaut: 60s) |
| `retryOnBlocked` | `boolean` | Retry si détecté comme bot |
| `maxRequestRetries` | `number` | Nombre de retries (défaut: 3) |

### launchContext (Chromium)

```ts
launchContext: {
  launchOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // autres args Chrome utiles :
    // '--disable-blink-features=AutomationControlled'  → éviter détection bot
    // '--lang=fr-BE'                                   → langue navigateur
  },
},
```

### Gestion des cookies / sessions

```ts
const crawler = new PlaywrightCrawler({
  async requestHandler({ page, browserController }) {
    // Récupérer les cookies
    const cookies = await page.context().cookies();
    // Injecter des cookies
    await page.context().addCookies([{ name: 'lang', value: 'fr', domain: '.brain-log.com' }]);
  },
});
```

---

## API `page` (Playwright)

### Attendre le chargement

```ts
await page.waitForLoadState('networkidle');   // attendre fin des requêtes réseau
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('.mon-element');   // attendre un élément spécifique
await page.waitForTimeout(2000);             // attendre 2 secondes
```

### Extraire du contenu

```ts
// Un seul élément
const titre = await page.$eval('h1', el => el.textContent?.trim());

// Plusieurs éléments
const items = await page.$$eval('ul li', els =>
  els.map(el => el.textContent?.trim())
);

// Attributs
const href = await page.$eval('a.cta', el => (el as HTMLAnchorElement).href);

// Tout le texte de la page
const bodyText = await page.innerText('body');
```

### Interagir avec la page

```ts
await page.click('button#submit');
await page.fill('input[name="email"]', 'test@test.com');
await page.selectOption('select[name="service"]', 'fulfilment');
await page.keyboard.press('Enter');
```

### Screenshots & PDF

```ts
await page.screenshot({ path: 'capture.png', fullPage: true });
await page.pdf({ path: 'page.pdf', format: 'A4' });
```

---

## `enqueueLinks` — Suivre des liens

```ts
// Tous les liens internes du même domaine
await enqueueLinks();

// Filtrer par glob pattern
await enqueueLinks({
  globs: ['https://www.brain-log.com/fr/**'],
});

// Filtrer par regex
await enqueueLinks({
  regexps: [/brain-log\.com\/services/],
});

// Limiter le nombre
await enqueueLinks({
  globs: ['https://www.brain-log.com/**'],
  limit: 20,
});

// Sélectionner seulement certains liens
await enqueueLinks({
  selector: 'nav a',
});
```

---

## `Dataset` — Stocker les données

```ts
// Écrire une entrée
await Dataset.pushData({ url, titre, prix });

// Lire toutes les données
const dataset = await Dataset.open();
const { items } = await dataset.getData();

// Supprimer le dataset (reset)
const ds = await Dataset.open();
await ds.drop();
```

Les données sont sauvegardées dans : `./storage/datasets/default/*.json`

---

## Exporter les résultats

```ts
import { writeFileSync } from 'fs';

const dataset = await Dataset.open();
const { items } = await dataset.getData();
writeFileSync('output.json', JSON.stringify(items, null, 2), 'utf-8');
```

---

## Patterns utilisés dans ce projet

### Pattern standard (scraping multi-pages)

```ts
// scripts/scrape-[site].ts
import { PlaywrightCrawler, Dataset } from 'crawlee';
import { writeFileSync } from 'fs';

const SEED_URLS = ['https://...', 'https://...'];

const crawler = new PlaywrightCrawler({
  async requestHandler({ page, request, log }) {
    log.info(`Scraping: ${request.url}`);
    await page.waitForLoadState('networkidle');

    // Extraire les données
    const headings = await page.$$eval('h1, h2, h3', els =>
      els.map(el => ({ tag: el.tagName, text: el.textContent?.trim() }))
    );

    await Dataset.pushData({ url: request.url, headings });
  },
  maxRequestsPerCrawl: 50,
  headless: true,
  launchContext: { launchOptions: { args: ['--no-sandbox'] } },
});

async function main() {
  const ds = await Dataset.open();
  await ds.drop(); // reset avant chaque run

  await crawler.run(SEED_URLS);

  const dataset = await Dataset.open();
  const { items } = await dataset.getData();
  writeFileSync('storage/output.json', JSON.stringify(items, null, 2));
  console.log(`✅ ${items.length} pages → storage/output.json`);
}

main().catch(console.error);
```

### Lancer un script

```bash
npx tsx scripts/scrape-brain-log.ts
```

---

## Scripts disponibles dans le projet

| Fichier | Cible | Données extraites |
|---|---|---|
| `scripts/scrape-brain-log.ts` | brain-log.com (8 pages) | headings, paragraphes, CTAs, formFields, listItems |

**Output :** `storage/brain-log-full.json`

---

## Anti-détection bot (si nécessaire)

```ts
launchContext: {
  launchOptions: {
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  },
},
// Dans requestHandler :
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
});
```

---

## Erreurs fréquentes

| Erreur | Cause | Fix |
|---|---|---|
| `Top-level await not supported` | Module CJS | Envelopper dans `async function main()` |
| `networkidle timeout` | Page longue à charger | Augmenter `navigationTimeoutSecs` |
| `enqueueLinks: 0 links` | Mauvais glob/domaine | Vérifier le domaine exact des liens |
| Page en mauvaise langue | Redirection auto | Forcer la langue via cookies ou URL directe |

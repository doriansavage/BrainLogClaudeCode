import { PlaywrightCrawler, Dataset } from 'crawlee';
import { writeFileSync } from 'fs';

const SEED_URLS = [
  'https://www.brain-log.com/fr',
  'https://www.brain-log.com/services/e-commerce',
  'https://www.brain-log.com/services/stockage',
  'https://www.brain-log.com/services/fulfilment',
  'https://www.brain-log.com/services/expeditions',
  'https://www.brain-log.com/a-propos',
  'https://www.brain-log.com/contact',
  'https://www.brain-log.com/devis',
];

const crawler = new PlaywrightCrawler({
  async requestHandler({ page, request, log }) {
    log.info(`Scraping: ${request.url}`);
    await page.waitForLoadState('networkidle');

    const url = request.url;
    const title = await page.title();
    const metaDesc = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);

    // Headings structurés
    const headings = await page.$$eval('h1, h2, h3, h4', els =>
      els.map(el => ({ tag: el.tagName, text: el.textContent?.trim() })).filter(h => h.text)
    );

    // Tous les paragraphes
    const paragraphs = await page.$$eval('p', els =>
      els.map(el => el.textContent?.trim()).filter(t => t && t.length > 20)
    );

    // Listes (features, avantages, étapes)
    const listItems = await page.$$eval('ul li, ol li', els =>
      els.map(el => el.textContent?.trim()?.replace(/\s+/g, ' ')).filter(t => t && t.length > 5 && t.length < 300)
    );

    // Formulaire devis — champs + labels
    const formFields = await page.$$eval('input, select, textarea', els =>
      els.map(el => ({
        tag: el.tagName,
        type: (el as HTMLInputElement).type || null,
        name: (el as HTMLInputElement).name || null,
        placeholder: (el as HTMLInputElement).placeholder || null,
        label: document.querySelector(`label[for="${(el as HTMLInputElement).id}"]`)?.textContent?.trim() || null,
        options: el.tagName === 'SELECT'
          ? Array.from((el as HTMLSelectElement).options).map(o => o.text.trim())
          : null,
      }))
    );

    // Tarifs / prix mentionnés
    const prices = await page.$$eval('*', els =>
      els.flatMap(el => {
        const text = el.childNodes[0]?.nodeValue?.trim() || '';
        return /[€$£]\s*\d+|\d+[,.]?\d*\s*[€$£]/.test(text) ? [text] : [];
      })
    );

    // CTAs
    const ctas = await page.$$eval('a, button', els =>
      els
        .map(el => ({ text: el.textContent?.trim()?.replace(/\s+/g, ' '), href: (el as HTMLAnchorElement).href || null }))
        .filter(c => c.text && c.text.length > 1 && c.text.length < 60)
    );

    await Dataset.pushData({
      url,
      title,
      metaDesc,
      headings,
      paragraphs,
      listItems,
      formFields,
      prices,
      ctas,
    });
  },

  maxRequestsPerCrawl: 20,
  headless: true,
  launchContext: {
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
});

async function main() {
  // Purger l'ancien dataset
  const { Dataset: DS } = await import('crawlee');
  const ds = await DS.open();
  await ds.drop();

  await crawler.run(SEED_URLS);

  // Exporter en JSON consolidé
  const dataset = await Dataset.open();
  const { items } = await dataset.getData();

  const output = JSON.stringify(items, null, 2);
  writeFileSync('storage/brain-log-full.json', output, 'utf-8');

  console.log(`\n✅ ${items.length} pages scrapées → storage/brain-log-full.json`);
}

main().catch(console.error);

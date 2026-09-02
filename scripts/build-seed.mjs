import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [, , inputPath, outputPath = 'data/seed-products.json'] = process.argv;

if (!inputPath) {
  throw new Error(
    'Usage: node scripts/build-seed.mjs <products.tsv> [output.json]',
  );
}

const source = await readFile(resolve(inputPath), 'utf8');
const [headerLine, ...rows] = source.trim().split(/\r?\n/);
const headers = headerLine.split('\t');

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const titleCase = (value) =>
  value
    .toLocaleLowerCase('lt-LT')
    .replace(/(^|[\s/-])\p{L}/gu, (letter) => letter.toLocaleUpperCase('lt-LT'))
    .replace(/^Lp\b/, "L'Oréal Professionnel")
    .replace(/^Kerastase\b/, 'Kérastase');

const seenSlugs = new Map();
const products = rows.filter(Boolean).map((line, index) => {
  const values = line.split('\t');
  const row = Object.fromEntries(
    headers.map((header, i) => [header, values[i] ?? '']),
  );
  const baseSlug = slugify(row.Pavadinimas);
  const slugCount = seenSlugs.get(baseSlug) ?? 0;
  seenSlugs.set(baseSlug, slugCount + 1);

  return {
    id: `sf-${String(index + 1).padStart(3, '0')}`,
    slug: slugCount ? `${baseSlug}-${slugCount + 1}` : baseSlug,
    name: titleCase(row.Pavadinimas),
    productType: row.Produktas,
    brand: row['Prekės ženklas'],
    size: row.Kiekis.replace('*', ''),
    priceCents: Math.round(Number.parseFloat(row.Kaina) * 100),
    unitPrice: row['Kaina/ml (arba /g)'],
    category: row.Kategorija,
    hairNeed: row['Plaukų poreikis'],
    sizeCategory: row['Talpos kategorija'],
    origin: row['Kilmės šalis'],
    ingredients: row['INCI sudėtis'],
    usage: row.Naudojimas,
    description: row.Aprašymas,
    imageKey: null,
    stock: 8 + ((index * 11) % 37),
    isFeatured: index < 12 || [31, 55, 87, 121].includes(index),
    status: 'active',
  };
});

await writeFile(
  resolve(outputPath),
  `${JSON.stringify(products, null, 2)}\n`,
  'utf8',
);
console.log(`Wrote ${products.length} products to ${outputPath}`);

import type { Product } from '@/lib/types';

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseProductInput(value: unknown, existing?: Product): Product {
  if (!value || typeof value !== 'object')
    throw new Error('Trūksta produkto duomenų.');
  const body = value as Record<string, unknown>;
  const name = text(body.name, existing?.name);
  const brand = text(body.brand, existing?.brand);
  const category = text(body.category, existing?.category);
  const price = Number(body.priceCents ?? existing?.priceCents ?? 0);
  const stock = Number(body.stock ?? existing?.stock ?? 0);
  if (!name || !brand || !category) {
    throw new Error('Pavadinimas, prekės ženklas ir kategorija yra privalomi.');
  }
  if (!Number.isFinite(price) || price < 0)
    throw new Error('Neteisinga kaina.');
  if (!Number.isFinite(stock) || stock < 0)
    throw new Error('Neteisingas likutis.');

  return {
    id: text(body.id, existing?.id),
    slug: slugify(text(body.slug) || name),
    name,
    productType: text(body.productType, existing?.productType),
    brand,
    size: text(body.size, existing?.size),
    priceCents: Math.round(price),
    unitPrice: text(body.unitPrice, existing?.unitPrice),
    category,
    hairNeed: text(body.hairNeed, existing?.hairNeed),
    sizeCategory: text(body.sizeCategory, existing?.sizeCategory),
    origin: text(body.origin, existing?.origin),
    ingredients: text(body.ingredients, existing?.ingredients),
    usage: text(body.usage, existing?.usage),
    description: text(body.description, existing?.description),
    imageKey:
      body.imageKey === null
        ? null
        : text(body.imageKey, existing?.imageKey ?? '') || null,
    stock: Math.floor(stock),
    isFeatured: Boolean(body.isFeatured ?? existing?.isFeatured),
    status: body.status === 'draft' ? 'draft' : 'active',
    createdAt: existing?.createdAt,
    updatedAt: existing?.updatedAt,
  };
}

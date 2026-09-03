import { sitePath } from './demo';

export const MAX_SELECTED_PRODUCTS = 6;
export function parseProductSelection(search: string): string[] | null {
  const params = new URLSearchParams(search);
  if (!params.has('ai')) return null;
  // An invalid/stale selection remains empty; never fall back to the whole store.
  return [...new Set((params.get('ai') ?? '').split(',').filter(id => /^sf-\d{3}$/.test(id)))].slice(0, MAX_SELECTED_PRODUCTS);
}
export function productSelectionUrl(ids: string[]) {
  const valid = [...new Set(ids.filter(id => /^sf-\d{3}$/.test(id)))].slice(0, MAX_SELECTED_PRODUCTS);
  return `${sitePath('/produktai')}?ai=${valid.join(',')}#atrinkti-produktai`;
}
export function selectCatalogProducts<T extends { id: string }>(products: T[], ids: string[] | null) {
  if (ids === null) return products;
  const selected = new Set(ids);
  return products.filter(product => selected.has(product.id));
}

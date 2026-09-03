import { MAX_SELECTED_PRODUCTS } from '../../lib/product-selection';

type Candidate = { id: string; name: string; priceCents: number; size: string };
export const ANSWER_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['products', 'answer'] },
    text: { type: 'string' },
    productIds: { type: 'array', items: { type: 'string' }, maxItems: MAX_SELECTED_PRODUCTS },
  }, required: ['kind', 'text', 'productIds'],
};

export function verifiedAnswer(raw: unknown, candidates: Candidate[], forceProducts = false) {
  const data: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || typeof data !== 'object' || !('kind' in data) || !('text' in data) || !('productIds' in data) || !Array.isArray(data.productIds) || typeof data.text !== 'string' || !['products', 'answer'].includes(String(data.kind))) throw new Error('Invalid AI response');
  if (forceProducts || data.kind === 'products' || data.productIds.length) {
    const allowed = new Map(candidates.map(p => [p.id, p]));
    const ids = [...new Set(data.productIds.filter((id): id is string => typeof id === 'string'))].slice(0, MAX_SELECTED_PRODUCTS);
    // Fail closed for any invented or out-of-candidate ID; never display model prose.
    const selected = ids.some(id => !allowed.has(id)) ? [] : ids.map(id => allowed.get(id)!);
    return {
      productIds: selected.map(p => p.id),
      text: selected.length
        ? `Atrinktos prekės iš „Sfinkso“ katalogo:\n\n${selected.map(p => `• ${p.name} (${p.size}) – ${(p.priceCents / 100).toFixed(2).replace('.', ',')} €`).join('\n')}`
        : 'Pagal šį klausimą tinkamų prekių atrinkti nepavyko. Patikslinkite priemonės tipą, plaukų poreikį arba kainą — renkuosi tik iš „Sfinkso“ katalogo.',
    };
  }
  if (!data.text.trim() || data.text.length > 3000) throw new Error('Invalid AI text');
  return { text: data.text.trim(), productIds: [] as string[] };
}

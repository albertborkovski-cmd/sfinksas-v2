import type { Metadata } from 'next';

import { Storefront } from '@/components/store/storefront';
import { listProducts, seedProducts } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Produktai · Sfinksas V2',
  description:
    'Visas profesionalių plaukų priežiūros priemonių „Sfinksas“ katalogas.',
};

export default async function ProductsPage() {
  let products = seedProducts();
  try {
    products = await listProducts();
  } catch {
    // The bundled catalog keeps the storefront complete during build previews.
  }

  return <Storefront products={products} view="catalog" />;
}

import type { Metadata } from 'next';

import { Storefront } from '@/components/store/storefront';
import { listProducts, seedProducts } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Apie mus · Sfinksas V2',
  description:
    '„Sfinksas“ grožio namų profesionalų žinios ir atrinkta plaukų priežiūra.',
};

export default async function AboutPage() {
  let products = seedProducts();
  try {
    products = await listProducts();
  } catch {
    // The bundled catalog keeps the shared shopping controls available.
  }

  return <Storefront products={products} view="about" />;
}

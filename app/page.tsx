import { Storefront } from '@/components/store/storefront';
import { listProducts, seedProducts } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = seedProducts();
  try {
    products = await listProducts();
  } catch {
    // The bundled catalog keeps the storefront complete during build previews.
  }

  return <Storefront products={products} />;
}

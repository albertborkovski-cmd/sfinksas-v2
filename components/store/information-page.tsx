import { Storefront } from '@/components/store/storefront';
import { listProducts, seedProducts } from '@/lib/server/store';

export async function InformationPage({
  view,
}: {
  view: 'services' | 'team' | 'contact';
}) {
  let products = seedProducts();
  try {
    products = await listProducts();
  } catch {
    // Preserve shared shopping controls during local previews.
  }

  return <Storefront products={products} view={view} />;
}

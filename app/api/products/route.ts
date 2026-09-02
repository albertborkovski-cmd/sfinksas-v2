import { getAdminUser, unauthorized } from '@/lib/server/admin';
import { listProducts, saveProduct } from '@/lib/server/store';
import { parseProductInput } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeDrafts = url.searchParams.get('includeDrafts') === 'true';
  if (includeDrafts && !(await getAdminUser())) return unauthorized();
  const products = await listProducts(includeDrafts);
  return Response.json({ products });
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return unauthorized();
  try {
    const product = parseProductInput(await request.json());
    product.id = crypto.randomUUID();
    await saveProduct(product);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Nepavyko sukurti produkto.',
      },
      { status: 400 },
    );
  }
}

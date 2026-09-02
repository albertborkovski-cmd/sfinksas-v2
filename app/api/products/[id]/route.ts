import { getAdminUser, unauthorized } from '@/lib/server/admin';
import { deleteProduct, listProducts, saveProduct } from '@/lib/server/store';
import { parseProductInput } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminUser())) return unauthorized();
  try {
    const { id } = await context.params;
    const existing = (await listProducts(true)).find(
      (product) => product.id === id,
    );
    if (!existing)
      return Response.json({ error: 'Produktas nerastas.' }, { status: 404 });
    const product = parseProductInput(await request.json(), existing);
    product.id = id;
    await saveProduct(product);
    return Response.json({ product });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Nepavyko išsaugoti produkto.',
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminUser())) return unauthorized();
  const { id } = await context.params;
  await deleteProduct(id);
  return Response.json({ ok: true });
}

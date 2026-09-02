import { getAdminUser, unauthorized } from '@/lib/server/admin';
import { createOrder, listOrders } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

function requiredText(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`${label} yra privalomas.`);
  return value.trim().slice(0, 500);
}

export async function GET() {
  if (!(await getAdminUser())) return unauthorized();
  return Response.json({ orders: await listOrders() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new Error('Krepšelis tuščias.');
    }
    const email = requiredText(body.email, 'El. paštas');
    if (!/^\S+@\S+\.\S+$/.test(email))
      throw new Error('Neteisingas el. pašto adresas.');
    const order = await createOrder({
      customerName: requiredText(body.customerName, 'Vardas'),
      email,
      phone: requiredText(body.phone, 'Telefono numeris'),
      address: requiredText(body.address, 'Pristatymo adresas'),
      note:
        typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '',
      items: body.items.map((item) => {
        const value = item as Record<string, unknown>;
        return {
          productId: requiredText(value.productId, 'Produkto ID'),
          quantity: Number(value.quantity),
        };
      }),
    });
    return Response.json(order, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Nepavyko pateikti užsakymo.',
      },
      { status: 400 },
    );
  }
}

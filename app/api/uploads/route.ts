import { env } from 'cloudflare:workers';

import { getAdminUser, unauthorized } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

export async function POST(request: Request) {
  if (!(await getAdminUser())) return unauthorized();
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'Pasirinkite nuotrauką.' }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return Response.json(
      { error: 'Tinka JPG, PNG, WEBP, GIF arba AVIF formatas.' },
      { status: 400 },
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json(
      { error: 'Nuotrauka negali viršyti 8 MB.' },
      { status: 400 },
    );
  }
  if (!env.FILES) {
    return Response.json(
      { error: 'Failų saugykla nepasiekiama.' },
      { status: 503 },
    );
  }

  const safeName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(-80);
  const key = `products/${crypto.randomUUID()}-${safeName || 'image'}`;
  await env.FILES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  });

  return Response.json({ key, url: `/api/files/${key}` }, { status: 201 });
}

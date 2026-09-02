import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  if (!env.FILES)
    return new Response('Failų saugykla nepasiekiama.', { status: 503 });
  const { key } = await context.params;
  const object = await env.FILES.get(key.join('/'));
  if (!object) return new Response('Nuotrauka nerasta.', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=86400');
  return new Response(object.body, { headers });
}

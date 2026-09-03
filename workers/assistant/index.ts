import { INSTRUCTIONS, knowledgeFor } from './knowledge';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Env = {
  AI_ENABLED: string;
  AI: { run(model: string, input: { messages: { role: string; content: string }[]; max_tokens: number; temperature: number }): Promise<{ response?: string }> };
  CHAT_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
};
const ORIGIN = 'https://albertborkovski-cmd.github.io';
const MAX_BODY = 40000;

export function validateMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object' || !('messages' in body) || !Array.isArray(body.messages)) return null;
  const messages = body.messages;
  if (!messages.length || messages.length > 9 || messages.length % 2 !== 1) return null;
  if (messages.some((m, i) => !m || m.role !== (i % 2 === 0 ? 'user' : 'assistant') || typeof m.content !== 'string' || !m.content.trim() || m.content.length > (m.role === 'user' ? 600 : 3000))) return null;
  if (messages.reduce((n, m) => n + m.content.length, 0) > 9000) return null;
  return messages.map(m => ({ role: m.role, content: m.content.trim() }));
}

async function limitedJSON(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const decoder = new TextDecoder();
  let size = 0, text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw new Error('size'); }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const headers: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    if (origin === ORIGIN) headers['Access-Control-Allow-Origin'] = ORIGIN;
    const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
    if (url.pathname === '/health' && request.method === 'GET') return reply({ status: 'ok', enabled: env.AI_ENABLED === 'true' });
    if (url.pathname !== '/chat') return reply({ error: 'Nerasta.' }, 404);
    if (origin !== ORIGIN) return reply({ error: 'Šis adresas skirtas „Sfinkso“ svetainei.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    if (request.method !== 'POST') return reply({ error: 'Netinkama užklausa.' }, 405);
    if (env.AI_ENABLED !== 'true') return reply({ error: 'Asistentas laikinai išjungtas.' }, 503);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply({ error: 'Netinkamas žinutės formatas.' }, 415);
    if (Number(request.headers.get('Content-Length')) > MAX_BODY) return reply({ error: 'Žinutė per ilga.' }, 413);
    let messages: ChatMessage[] | null;
    try { messages = validateMessages(await limitedJSON(request)); } catch { return reply({ error: 'Netinkama arba per ilga žinutė.' }, 400); }
    if (!messages) return reply({ error: 'Žinutė per ilga arba netinkamo formato.' }, 400);
    try {
      // Anonymous demo: IP limits may be shared by visitors on the same network.
      // Cloudflare rate limits are per location; the Workers Free quota is the hard account cap.
      const ip = request.headers.get('CF-Connecting-IP');
      if (!ip) return reply({ error: 'Nepavyko patikrinti užklausos.' }, 403);
      if (!(await env.CHAT_LIMIT.limit({ key: `chat:${ip}` })).success) {
        headers['Retry-After'] = '60';
        return reply({ error: 'Per daug žinučių. Pabandykite po minutės.' }, 429);
      }
      const query = messages.filter(m => m.role === 'user').slice(-2).map(m => m.content).join(' ');
      const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{ role: 'system', content: `${INSTRUCTIONS}\n\nSALONO DUOMENYS (JSON):\n${knowledgeFor(query)}` }, ...messages],
        max_tokens: 450, temperature: 0.3,
      });
      if (typeof result.response !== 'string' || !result.response.trim()) throw new Error('empty');
      return reply({ text: result.response.trim().slice(0, 3000) });
    } catch {
      // Never expose or log prompts, visitor messages, credentials or upstream error details.
      return reply({ error: 'Asistentas šiuo metu nepasiekiamas arba išnaudotas dienos limitas. Pabandykite vėliau; registracija „Treatwell“ veikia įprastai.' }, 503);
    }
  },
};

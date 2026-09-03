export const ASSISTANT_ENDPOINT = 'https://sfinksas-assistant.albertborkovski-sfinksas.workers.dev/chat';
const SITE = 'https://albertborkovski-cmd.github.io/sfinksas-v2';
const allowedLinks = new Set([
  `${SITE}/produktai/`, `${SITE}/paslaugos/`, `${SITE}/musu-meistrai/`, `${SITE}/kontaktai/`,
  'https://www.treatwell.lt/salonas/grozio-namai-sfinksas/',
]);

// Exact URLs only: no arbitrary model-generated queries, image requests or domains.
export function safeAssistantUrl(url: string) {
  return allowedLinks.has(url) ? url : undefined;
}

export type ConversationMessage = { role: 'user' | 'assistant'; text: string };
export async function askAssistant(messages: ConversationMessage[], signal: AbortSignal): Promise<string> {
  let history = messages.slice(-9);
  while (history.length > 1 && history.reduce((n, m) => n + m.text.length, 0) > 8000) history = history.slice(2);
  const response = await fetch(ASSISTANT_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    credentials: 'omit', referrerPolicy: 'no-referrer',
    body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.text })) }),
  });
  if (response.status === 429) throw new Error('Per daug žinučių. Pabandykite po minutės.');
  if (!response.ok) throw new Error('Asistentas laikinai nepasiekiamas arba išnaudotas dienos limitas. Pabandykite vėliau.');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('text' in data) || typeof data.text !== 'string' || !data.text.trim() || data.text.length > 3000) throw new Error('Nepavyko gauti atsakymo. Pabandykite dar kartą.');
  return data.text;
}

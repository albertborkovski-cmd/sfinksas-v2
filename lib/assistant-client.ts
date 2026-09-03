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
export type AssistantAnswer = { text: string; productIds: string[]; actions: AssistantAction[] };
export async function askAssistant(messages: ConversationMessage[], signal: AbortSignal): Promise<AssistantAnswer> {
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
  const ids = 'productIds' in data ? data.productIds : [];
  if (!Array.isArray(ids) || ids.length > MAX_SELECTED_PRODUCTS || ids.some(id => typeof id !== 'string' || !/^sf-\d{3}$/.test(id))) throw new Error('Nepavyko patikrinti atrinktų prekių. Pabandykite dar kartą.');
  return { text: data.text, productIds: [...new Set(ids)], actions: verifiedActions('actions' in data ? data.actions : []) };
}
import { MAX_SELECTED_PRODUCTS } from './product-selection';
import { verifiedActions, type AssistantAction } from './assistant-actions';

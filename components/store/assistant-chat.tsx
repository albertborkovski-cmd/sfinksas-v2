'use client';

import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, LoaderCircle, Scissors, Send, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message, MessageContent, MessageGroup } from '@/components/ui/message';
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { askAssistant, safeAssistantUrl, type ConversationMessage } from '@/lib/assistant-client';
import { sitePath } from '@/lib/demo';
import { productSelectionUrl } from '@/lib/product-selection';
import { formatPrice, type Product } from '@/lib/types';
import { resolveAssistantAction, type AssistantAction } from '@/lib/assistant-actions';

type ChatMessage = ConversationMessage & { id: number; productIds?: string[]; actions?: AssistantAction[] };
const welcome: ChatMessage = {
  id: 0, role: 'assistant',
  text: 'Sveiki! Esu „Sfinkso“ AI asistentas. Padėsiu rasti produktus, paslaugas ar meistrą. Kuo galiu padėti?',
};
const suggestions = ['Produktai', 'Paslaugos', 'Registracija'];
const MessageResponse = lazy(() => import('@/components/ai-elements/message').then(module => ({ default: module.MessageResponse })));
const markdownElements = ['p', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'blockquote'];
const markdownComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => safeAssistantUrl(href ?? '') ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{children}</a> : <span>{children}</span>,
};

function StylistIcon() {
  return (
    <span aria-hidden="true" className="relative block size-7">
      <UserRound className="absolute left-0 top-0 size-6" strokeWidth={1.5} />
      <Scissors className="absolute -bottom-0.5 -right-1 size-4 rounded-sm bg-[#302c26] text-[#deccb0]" strokeWidth={1.8} />
    </span>
  );
}

export function AssistantChat({ products = [] }: { products?: Product[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryMessages, setRetryMessages] = useState<ChatMessage[] | null>(null);
  const pending = useRef<AbortController | null>(null);
  const sequence = useRef(1);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages.length, open, loading, error]);

  useEffect(() => () => pending.current?.abort(), []);

  async function requestAnswer(conversation: ChatMessage[]) {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    setError('');
    const timeout = window.setTimeout(() => controller.abort(), 45000);
    try {
      const result = await askAssistant(conversation.filter(m => m.id !== 0), controller.signal);
      if (result.productIds.some(id => !products.some(p => p.id === id && p.status === 'active'))) throw new Error('Katalogas pasikeitė. Atnaujinkite puslapį ir pakartokite klausimą.');
      const answer: ChatMessage = { id: sequence.current++, role: 'assistant', ...result };
      setMessages(current => [...current, answer]);
      setRetryMessages(null);
    } catch (cause) {
      setError(controller.signal.aborted ? 'Atsakymas užtruko. Pabandykite dar kartą.' : cause instanceof Error ? cause.message : 'Ryšio klaida. Pabandykite dar kartą.');
      setRetryMessages(conversation);
    } finally {
      window.clearTimeout(timeout);
      pending.current = null;
      setLoading(false);
    }
  }

  function sendMessage(text: string) {
    const clean = text.trim().slice(0, 600);
    if (!clean || pending.current) return;
    const question: ChatMessage = { id: sequence.current++, role: 'user', text: clean };
    // Replace an unanswered turn after a failure, keeping alternating history.
    const previous = messages.at(-1)?.role === 'user' ? messages.slice(0, -1) : messages;
    const conversation = [...previous.slice(-18), question];
    setMessages(conversation);
    setDraft('');
    setRetryMessages(null);
    void requestAnswer(conversation);
    input.current?.focus();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  return (
    <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button />}
          aria-label="Atidaryti AI asistento pokalbį"
          title="Sfinkso AI asistentas"
          className="relative size-12 rounded-full border border-[#deccb0]/50 bg-[#302c26] p-0 text-[#faf6ed] shadow-[0_4px_20px_#302c2630] hover:bg-[#423b32] focus-visible:ring-[#a38d6c] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
        >
          <StylistIcon />
          <span aria-hidden="true" className="absolute -right-1 -top-1 rounded-full border border-[#302c26]/10 bg-[#e4d5bd] px-1 text-[8px] leading-[14px] font-semibold tracking-wide text-[#302c26]">AI</span>
        </PopoverTrigger>
        <PopoverContent
          side="top" align="end" sideOffset={12}
          initialFocus={input}
          className="flex h-[480px] max-h-[min(520px,calc(100dvh-100px),var(--available-height))] w-[calc(100vw-2rem)] max-w-[360px] gap-0 overflow-hidden rounded-[22px] bg-[#f7f3ec] p-0 text-[#302c26] shadow-[0_16px_60px_#302c2630] motion-reduce:animate-none"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-[#f0e8dc] px-4 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#302c26] text-[#faf6ed]"><StylistIcon /></span>
            <div className="min-w-0 flex-1">
              <PopoverTitle className="text-sm font-semibold">Sfinkso asistentas</PopoverTitle>
              <PopoverDescription className="mt-1 text-[11px] text-[#766653]">Jūsų grožio gidas · AI</PopoverDescription>
            </div>
            <Button variant="ghost" aria-label="Uždaryti pokalbį" className="size-9 rounded-full p-0" onClick={() => setOpen(false)}><X className="size-4" /></Button>
          </header>
          <div ref={log} role="log" aria-label="Pokalbio žinutės" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <MessageGroup className="gap-3">
              {messages.map(message => (
                <Message key={message.id} align={message.role === 'user' ? 'end' : 'start'}>
                  <MessageContent className={`max-w-[90%] rounded-2xl px-3.5 py-3 text-[13px] leading-6 ${message.role === 'user' ? 'rounded-br-sm bg-[#302c26] text-[#faf6ed]' : 'rounded-bl-sm border border-black/5 bg-white/80'}`}>
                    <span className="sr-only">{message.role === 'user' ? 'Jūs: ' : 'Asistentas: '}</span>
                    {message.productIds?.length ? <>
                      <p className="text-xs font-medium">Atrinktos prekės iš mūsų katalogo</p>
                      <ul className="flex flex-col gap-2" aria-label="AI atrinktos prekės">
                        {message.productIds.map(id => {
                          const product = products.find(p => p.id === id);
                          return product ? <li key={id} className="rounded-xl border border-[#d8cbb9] bg-[#f7f3ec] p-3">
                            <a href={productSelectionUrl([id])} className="block text-[12px] leading-5 font-medium underline-offset-4 hover:underline">{product.name}</a>
                            <div className="mt-1 flex flex-wrap justify-between gap-2 text-[11px] text-[#766653]"><span>{product.size}</span><strong className="text-[#302c26]">{formatPrice(product.priceCents)}</strong></div>
                          </li> : null;
                        })}
                      </ul>
                      <Button render={<a href={productSelectionUrl(message.productIds)} />} nativeButton={false} className="h-auto min-h-10 whitespace-normal rounded-full bg-[#302c26] px-3 py-2 text-xs text-white">Rodyti atrinktus produktus <ArrowRight className="size-3.5" /></Button>
                    </> : message.role === 'user' ? <p className="whitespace-pre-wrap break-words">{message.text}</p> : <Suspense fallback={<span className="text-xs">Kraunamas atsakymas…</span>}><MessageResponse
                      mode="static" controls={false} skipHtml
                      allowedElements={markdownElements}
                      urlTransform={safeAssistantUrl}
                      components={markdownComponents}
                      className="break-words text-[13px] leading-6 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_p]:my-2 [&_li]:my-1 [&_ul]:pl-4 [&_ol]:pl-4"
                    >{message.text}</MessageResponse></Suspense>}
                    {!!message.actions?.length && <ul aria-label="Asistento siūlomi veiksmai" className="mt-3 flex flex-col gap-2">
                      {message.actions.map(action => {
                        const link = resolveAssistantAction(action);
                        return link ? <li key={`${action.type}:${action.target}`}>
                          <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined} className="block rounded-xl border border-[#d8cbb9] bg-[#f7f3ec] p-3 text-xs leading-5 hover:bg-[#e8dfd1] focus-visible:outline-2 focus-visible:outline-[#766653]">
                            <span className="flex items-center justify-between gap-2 font-medium">{link.label}<ArrowRight aria-hidden="true" className="size-3.5 shrink-0" /></span>
                            {link.detail && <span className="mt-1 block text-[11px] text-[#766653]">{link.detail}</span>}
                            {link.external && <span className="sr-only">Atidaroma naujame skirtuke</span>}
                          </a>
                        </li> : null;
                      })}
                    </ul>}
                  </MessageContent>
                </Message>
              ))}
            </MessageGroup>
            {loading && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-[#766653]"><LoaderCircle className="size-3.5 motion-safe:animate-spin" />Asistentas rašo…</p>}
            {error && <div role="alert" className="mt-3 rounded-xl border border-[#d8cbb9] bg-white p-3 text-xs leading-5"><p>{error}</p>{retryMessages && <Button variant="link" className="mt-1 h-auto p-0 text-xs" onClick={() => void requestAnswer(retryMessages)} disabled={loading}>Bandyti dar kartą</Button>}<a className="mt-2 block underline" href={sitePath('/musu-meistrai')}>Registruotis pas meistrą</a></div>}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5 px-4 pb-3">
            {suggestions.map(text => <Button key={text} disabled={loading} variant="outline" className="h-8 rounded-full border-[#d8cbb9] bg-transparent px-3 text-[11px] font-medium" onClick={() => sendMessage(text)}>{text}</Button>)}
          </div>
          <form onSubmit={submit} className="shrink-0 border-t border-black/10 bg-white/40 p-3">
            <div className="flex items-center gap-2">
              <Input ref={input} aria-label="Jūsų žinutė asistentui" value={draft} onChange={event => setDraft(event.target.value)} maxLength={600} placeholder="Parašykite žinutę…" autoComplete="off" className="h-11 rounded-full border-black/10 bg-white px-4 text-base sm:text-sm" />
              <Button type="submit" disabled={loading || !draft.trim()} aria-label="Siųsti žinutę" className="size-11 rounded-full bg-[#302c26] p-0"><Send className="size-4" /></Button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-4 text-[#766653]">Žinutės siunčiamos „Cloudflare“ AI. Nerašykite jautrių duomenų. AI gali klysti.</p>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

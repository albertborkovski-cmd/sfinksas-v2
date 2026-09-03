'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Scissors, Send, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message, MessageContent, MessageGroup } from '@/components/ui/message';
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { demoReply, type AssistantReply } from '@/lib/assistant-demo';
import { sitePath } from '@/lib/demo';

type ChatMessage = AssistantReply & { id: number; role: 'user' | 'assistant' };
const welcome: ChatMessage = {
  id: 0, role: 'assistant',
  text: 'Sveiki! Esu „Sfinkso“ asistento demonstracija. Padėsiu rasti produktus, paslaugas ar meistrą. Nuo ko pradėsime?',
};
const suggestions = ['Produktai', 'Paslaugos', 'Registracija'];

function StylistIcon() {
  return (
    <span aria-hidden="true" className="relative block size-7">
      <UserRound className="absolute left-0 top-0 size-6" strokeWidth={1.5} />
      <Scissors className="absolute -bottom-0.5 -right-1 size-4 rounded-sm bg-[#302c26] text-[#deccb0]" strokeWidth={1.8} />
    </span>
  );
}

export function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const sequence = useRef(1);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages.length, open]);

  function sendMessage(text: string) {
    const clean = text.trim().slice(0, 600);
    if (!clean) return;
    const question: ChatMessage = { id: sequence.current++, role: 'user', text: clean };
    const answer: ChatMessage = { id: sequence.current++, role: 'assistant', ...demoReply(clean) };
    setMessages(current => [...current.slice(-58), question, answer]);
    setDraft('');
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
          title="Sfinkso asistentas · pokalbio demonstracija"
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
              <PopoverDescription className="mt-1 text-[11px] text-[#766653]">AI pokalbio demonstracija</PopoverDescription>
            </div>
            <Button variant="ghost" aria-label="Uždaryti pokalbį" className="size-9 rounded-full p-0" onClick={() => setOpen(false)}><X className="size-4" /></Button>
          </header>
          <div ref={log} role="log" aria-label="Pokalbio žinutės" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <MessageGroup className="gap-3">
              {messages.map(message => (
                <Message key={message.id} align={message.role === 'user' ? 'end' : 'start'}>
                  <MessageContent className={`max-w-[90%] rounded-2xl px-3.5 py-3 text-[13px] leading-6 ${message.role === 'user' ? 'rounded-br-sm bg-[#302c26] text-[#faf6ed]' : 'rounded-bl-sm border border-black/5 bg-white/80'}`}>
                    <span className="sr-only">{message.role === 'user' ? 'Jūs: ' : 'Asistentas: '}</span>
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    {message.link && <a href={sitePath(message.link.href)} className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4">{message.link.label}<ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" /></a>}
                  </MessageContent>
                </Message>
              ))}
            </MessageGroup>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5 px-4 pb-3">
            {suggestions.map(text => <Button key={text} variant="outline" className="h-8 rounded-full border-[#d8cbb9] bg-transparent px-3 text-[11px] font-medium" onClick={() => sendMessage(text)}>{text}</Button>)}
          </div>
          <form onSubmit={submit} className="shrink-0 border-t border-black/10 bg-white/40 p-3">
            <div className="flex items-center gap-2">
              <Input ref={input} aria-label="Jūsų žinutė asistentui" value={draft} onChange={event => setDraft(event.target.value)} maxLength={600} placeholder="Parašykite žinutę…" autoComplete="off" className="h-11 rounded-full border-black/10 bg-white px-4 text-base sm:text-sm" />
              <Button type="submit" disabled={!draft.trim()} aria-label="Siųsti žinutę" className="size-11 rounded-full bg-[#302c26] p-0"><Send className="size-4" /></Button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-4 text-[#766653]">AI dar neprijungtas · paruošti atsakymai · žinutės nesaugomos</p>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

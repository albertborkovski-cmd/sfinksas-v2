'use client';

import { useState } from 'react';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import team from '@/lib/team.json';
import { cn } from '@/lib/utils';

type Member = (typeof team.members)[number];
const filters = ['Visi', 'Plaukai', 'Nagai', 'Veidas', 'Kūnas'];

function Portrait({ member }: { member: Member }) {
  return member.image ? (
    <img src={member.image} alt={member.name} width={96} height={96} loading="lazy" className="size-20 shrink-0 rounded-full object-cover sm:size-24" />
  ) : (
    <span aria-hidden="true" className="font-display flex size-20 shrink-0 items-center justify-center rounded-full bg-[#e5ddd0] text-3xl text-[#766653] sm:size-24">{member.name.charAt(0)}</span>
  );
}

function MemberCard({ member }: { member: Member }) {
  const groups = [...new Set(member.services.map((service) => service.category))];
  return (
    <article id={`meistras-${member.id}`} className="flex scroll-mt-28 flex-col rounded-2xl border border-black/10 bg-white/35">
      <Dialog>
        <DialogTrigger render={<button type="button" />} className="group flex flex-1 flex-col items-start rounded-2xl p-6 text-left transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#766653]">
          <Portrait member={member} />
          <h2 className="font-display mt-5 text-2xl leading-tight tracking-tight">{member.name}</h2>
          <p className="mt-2 text-xs font-medium text-[#766653]">{member.title}</p>
          <p className="mb-6 mt-3 text-sm leading-6 text-black/60">{member.description}</p>
          <span className="mt-auto inline-flex items-center gap-3 text-sm font-medium">
            Peržiūrėti paslaugas <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
          </span>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden rounded-2xl bg-[#f7f3ec] p-0 sm:max-w-[720px]">
          <DialogHeader className="shrink-0 border-b border-black/10 p-5 pr-12 sm:p-7 sm:pr-14">
            <div className="flex items-center gap-4">
              <Portrait member={member} />
              <div className="min-w-0">
                <DialogTitle className="font-display text-2xl leading-tight sm:text-3xl">{member.name}</DialogTitle>
                <p className="mt-2 text-xs leading-5 text-[#766653]">{member.title}</p>
              </div>
            </div>
            <DialogDescription className="mt-3 text-sm leading-6 text-black/60">{member.description}</DialogDescription>
          </DialogHeader>
          <DialogClose render={<Button variant="ghost" size="icon-lg" />} className="absolute right-2 top-2 rounded-full" aria-label="Uždaryti meistro paslaugas">
            <X aria-hidden="true" />
          </DialogClose>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <h3 className="text-base font-semibold">Siūlomos paslaugos</h3>
            {groups.length > 0 ? (
              <div className="mt-5 space-y-6">
                {groups.map((group) => (
                  <section key={group}>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#766653]">{group}</h4>
                    <ul className="divide-y divide-black/10">
                      {member.services.filter((service) => service.category === group).map((service) => (
                        <li key={service.id} className="py-3 text-sm leading-6">{service.name}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-black/10 bg-white/50 p-4 text-sm leading-6 text-black/65">
                <p>Profilyje nurodytos sritys: {member.categories.join(', ')}.</p>
                <p className="mt-2">Konkrečios individualios paslaugos viešame meniu šiuo metu nepriskirtos. Paslaugas ir registraciją patikslinkite per meistro profilį arba saloną.</p>
              </div>
            )}
            <p className="mt-5 text-xs leading-5 text-black/55">Sąrašas parengtas pagal „Treatwell“ duomenis. Aktualias kainas, galimas paslaugas ir laisvus laikus patikrinkite registracijos metu.</p>
          </div>
          <div className="shrink-0 border-t border-black/10 bg-[#f7f3ec] p-4 sm:px-7">
            <a href={member.profileUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants(), 'h-11 w-full gap-3 rounded-full px-5 sm:w-auto')}>
              Profilis ir registracija <ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only">Treatwell, naujame skirtuke</span>
            </a>
            <p className="mt-2 text-[11px] leading-5 text-black/55">Atidarysime meistro profilį „Treatwell“. Paslaugą ir laiką pasirinksite ten.</p>
          </div>
        </DialogContent>
      </Dialog>
      <a href={member.profileUrl} target="_blank" rel="noopener noreferrer" className="mx-6 flex items-center justify-between gap-3 border-t border-black/10 py-4 text-xs text-black/60 underline-offset-4 hover:underline">
        Meistro profilis „Treatwell“ <ArrowUpRight aria-hidden="true" className="size-3.5" />
        <span className="sr-only">{member.name}, naujame skirtuke</span>
      </a>
    </article>
  );
}

export function Team() {
  const [filter, setFilter] = useState('Visi');
  const members = team.members.filter((member) => filter === 'Visi' || member.categories.includes(filter));
  return (
    <section className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Grožio namai Sfinksas · Komanda</p>
          <h1 className="font-display mt-4 text-4xl tracking-tight sm:text-5xl">Mūsų meistrai</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-black/60">Susipažinkite su komanda. Pasirinkite meistrą ir peržiūrėkite jo siūlomas paslaugas.</p>
        </div>
        <a href={`${team.source}#team`} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 py-2 text-xs underline underline-offset-4">
          Komanda „Treatwell“ <ArrowUpRight aria-hidden="true" className="size-4" />
          <span className="sr-only">naujame skirtuke</span>
        </a>
      </div>
      <div aria-label="Filtruoti meistrus pagal sritį" className="flex flex-wrap gap-2 py-6">
        {filters.map((category) => (
          <Button key={category} variant={filter === category ? 'default' : 'outline'} aria-pressed={filter === category} onClick={() => setFilter(category)} className="h-10 rounded-full px-5 text-xs">{category}</Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => <MemberCard key={member.id} member={member} />)}
      </div>
      <p className="mt-8 text-xs leading-5 text-black/55">Informacijos ir nuotraukų šaltinis – „Treatwell“ salono profiliai. Atnaujinta 2026-09-03. Registracija vyksta „Treatwell“ platformoje.</p>
    </section>
  );
}

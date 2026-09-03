import {
  ArrowUpRight,
  CalendarDays,
  Droplets,
  Eye,
  Hand,
  MapPin,
  Paintbrush,
  Scissors,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const bookingUrl = 'https://www.treatwell.lt/salonas/grozio-namai-sfinksas/';

// Service groups and salon photograph: the salon's public Treatwell profile.
// Prices and availability remain on Treatwell so they are never shown stale here.
const services = [
  { title: 'Kirpimas ir sušukavimas', detail: 'Moterų, vyrų ir vaikų kirpimas. Šukuosenos ir sušukavimas.', icon: Scissors },
  { title: 'Plaukų dažymas', detail: 'Šaknų dažymas, Balayage ir Air Touch technikos.', icon: Paintbrush },
  { title: 'Plaukų priežiūra ir SPA', detail: 'Milbon plaukų SPA ir plaukų priežiūros procedūros.', icon: Droplets },
  { title: 'Manikiūras ir pedikiūras', detail: 'Nagų priežiūra, lakavimas ir nagų priauginimas.', icon: Hand },
  { title: 'Antakiai ir blakstienos', detail: 'Antakių korekcija, dažymas ir laminavimas. Blakstienų procedūros.', icon: Eye },
  { title: 'Makiažas', detail: 'Makiažo paslaugos jūsų pasirinktai progai.', icon: Paintbrush },
];

function BookingLink({ light = false }: { light?: boolean }) {
  return (
    <a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ size: 'lg' }),
        'h-12 w-full gap-4 rounded-full px-7 sm:w-fit',
        light && 'bg-[#f3eee5] text-[#28251f] hover:bg-white',
      )}
    >
      Registruotis vizitui <ArrowUpRight aria-hidden="true" className="size-4" />
      <span className="sr-only">per Treatwell, naujame skirtuke</span>
    </a>
  );
}

export function Services() {
  return (
    <div>
      <section className="mx-auto grid max-w-[1480px] gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-16">
        <div className="py-4 lg:py-10">
          <p className="eyebrow">Grožio namai Sfinksas · Paslaugos</p>
          <h1 className="font-display mt-6 text-[42px] leading-[1.06] tracking-[-0.035em] sm:text-6xl xl:text-[72px]">
            Jūsų laikas.<br />
            <em className="font-normal text-[#766653]">Jūsų grožis.</em>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-black/60">
            Nuo naujo kirpimo iki mažų, svarbių detalių.
            Atraskite savo grožio ritualą „Sfinkso“ namuose.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3">
            <BookingLink />
            <p className="text-xs leading-5 text-black/55">
              Paslaugą, meistrą ir laiką pasirinksite „Treatwell“.
            </p>
          </div>
          <p className="mt-9 flex items-center gap-2 border-t border-black/10 pt-5 text-xs text-black/60">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            Konstitucijos pr. 21B, Vilnius
          </p>
        </div>
        <figure className="relative overflow-hidden rounded-[24px] bg-[#ddd5cb] sm:rounded-[32px]">
          <img
            src="/salon-treatwell.jpg"
            alt="Grožio namų Sfinksas interjeras: marmuro detalės, veidrodžiai ir augalai"
            width={1080}
            height={720}
            fetchPriority="high"
            className="aspect-[4/3] w-full object-cover lg:aspect-[1/1]"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-6 pb-6 pt-16 text-white sm:px-8 sm:pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">Jūsų grožio adresas</p>
            <p className="font-display mt-2 text-2xl sm:text-3xl">Susitikime „Sfinkse“.</p>
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="services-heading" className="border-t border-black/10 bg-[#eee8df]/60">
        <div className="mx-auto max-w-[1480px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Atraskite savo ritualą</p>
              <h2 id="services-heading" className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Mūsų paslaugos</h2>
            </div>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 text-sm underline underline-offset-4 hover:text-[#766653]">
              Visos paslaugos ir kainos <ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only">Treatwell, naujame skirtuke</span>
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, detail, icon: Icon }) => (
              <a key={title} href={bookingUrl} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-black/10 bg-background p-6 transition-colors hover:border-[#9c8b75] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#766653] sm:p-7">
                <div className="flex items-center justify-between text-[#766653]">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                  <ArrowUpRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-6 text-base font-medium">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-black/60">{detail}</p>
                <span className="sr-only">Atverti salono paslaugas Treatwell, naujame skirtuke</span>
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-black/55">Aktualias kainas, paslaugų trukmę ir laisvus laikus rasite „Treatwell“ registracijoje.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-col gap-8 rounded-3xl bg-[#28251f] p-7 text-[#f3eee5] sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <CalendarDays aria-hidden="true" className="mt-1 hidden size-7 shrink-0 text-[#c6b69e] sm:block" strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-3xl tracking-tight">Laikas pasirūpinti savimi.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Išsirinkite paslaugą, savo meistrą ir patogų laiką. Registraciją užbaigsite „Treatwell“ platformoje.</p>
            </div>
          </div>
          <div className="shrink-0">
            <BookingLink light />
            <p className="mt-3 text-center text-xs text-white/60">Atidaroma naujame skirtuke</p>
          </div>
        </div>
      </section>
    </div>
  );
}

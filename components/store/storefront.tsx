'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleUserRound,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { CartLine, Product } from '@/lib/types';
import { formatPrice, productImageUrl } from '@/lib/types';

const categoryOrder = [
  'Plaukų priežiūra',
  'Stiliaus formavimas',
  'Aksesuaras',
  'Elektroninis įrankis',
  'Rinkinys',
  'Kvepalai',
  'Maisto papildas',
];

const categoryNames: Record<string, string> = {
  Aksesuaras: 'Aksesuarai',
  'Elektroninis įrankis': 'Elektroniniai įrankiai',
  'Maisto papildas': 'Maisto papildai',
};

const categoryCopy: Record<string, string> = {
  'Plaukų priežiūra': 'Kasdieniai ritualai sveikesniems plaukams',
  'Stiliaus formavimas': 'Tekstūra, apsauga ir ilgai išliekanti forma',
  Aksesuaras: 'Profesionalūs įrankiai namų ritualui',
  'Elektroninis įrankis': 'Salono rezultatas jūsų namuose',
  Rinkinys: 'Apgalvotos priežiūros kombinacijos',
  Kvepalai: 'Išskirtinis aromatas paskutiniam akcentui',
  'Maisto papildas': 'Grožis ir stiprybė iš vidaus',
};

const categoryTones = [
  'bg-[#28251f] text-white',
  'bg-[#d8cfc0]',
  'bg-[#c9c0b2]',
  'bg-[#e3ddd2]',
  'bg-[#bbb1a3]',
  'bg-[#d7d1c7]',
  'bg-[#c8beb0]',
  'bg-[#e7e1d7]',
];

const brandTones: Record<string, string> = {
  Kérastase: '#d8d2c7',
  "L'Oréal Professionnel": '#e0ddd5',
  'Balmain Hair Couture': '#c6bfb3',
  Moerie: '#b9b2a6',
};

function displayCategory(category: string) {
  return categoryNames[category] ?? category;
}

function ProductVisual({
  product,
  compact = false,
  detail = false,
}: {
  product: Product;
  compact?: boolean;
  detail?: boolean;
}) {
  const imageUrl = productImageUrl(product);
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={product.name}
        className={`h-full w-full transition-transform duration-700 group-hover:scale-[1.025] ${detail ? 'bg-[#e8e2d8] object-contain p-6 sm:p-10' : 'object-cover'}`}
      />
    );
  }

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: brandTones[product.brand] ?? '#d7d1c6' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.72),transparent_25%),linear-gradient(145deg,transparent_35%,rgba(23,21,18,.12))]" />
      <div
        className={`${compact ? 'inset-3' : 'inset-5 sm:inset-8'} absolute border border-black/10 transition-transform duration-500 group-hover:scale-[.97]`}
      />
      <span
        className={`${compact ? 'text-[9px]' : 'text-[clamp(1rem,1.8vw,1.65rem)]'} relative -rotate-90 whitespace-nowrap font-semibold uppercase tracking-[0.2em] text-black/34`}
      >
        {product.brand}
      </span>
    </div>
  );
}

export function Storefront({
  products,
  view = 'home',
}: {
  products: Product[];
  view?: 'home' | 'catalog' | 'about';
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Visi');
  const [brand, setBrand] = useState('Visi');
  const [sort, setSort] = useState('recommended');
  const [visibleCount, setVisibleCount] = useState(16);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
  } | null>(null);
  const [orderError, setOrderError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('sfinksas-cart');
      if (saved) setCart(JSON.parse(saved) as Record<string, number>);
    } catch {
      // A blocked browser store should never block shopping.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('sfinksas-cart', JSON.stringify(cart));
    } catch {
      // The cart still works for the current visit.
    }
  }, [cart]);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categoryOrder.map((item) => [
          item,
          products.filter((product) => product.category === item).length,
        ]),
      ),
    [products],
  );
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand))].sort(),
    [products],
  );
  const featured = useMemo(
    () => products.filter((product) => product.isFeatured).slice(0, 5),
    [products],
  );
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('lt-LT');
    const result = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.brand, product.productType, product.hairNeed]
          .join(' ')
          .toLocaleLowerCase('lt-LT')
          .includes(normalizedQuery);
      return (
        matchesQuery &&
        (category === 'Visi' || product.category === category) &&
        (brand === 'Visi' || product.brand === brand)
      );
    });
    return result.toSorted((a, b) => {
      if (sort === 'price-asc') return a.priceCents - b.priceCents;
      if (sort === 'price-desc') return b.priceCents - a.priceCents;
      if (sort === 'name') return a.name.localeCompare(b.name, 'lt');
      return (
        Number(b.isFeatured) - Number(a.isFeatured) ||
        a.name.localeCompare(b.name, 'lt')
      );
    });
  }, [brand, category, products, query, sort]);

  const cartLines: CartLine[] = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: products.find((item) => item.id === id),
      quantity,
    }))
    .filter(
      (line): line is CartLine => Boolean(line.product) && line.quantity > 0,
    );
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cartLines.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  );

  function addToCart(product: Product) {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
    setSelectedProduct(null);
    setCheckoutMode(false);
    setCartOpen(true);
  }

  function changeQuantity(productId: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[productId];
      else next[productId] = Math.min(20, quantity);
      return next;
    });
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingOrder(true);
    setOrderError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerName: form.get('customerName'),
        email: form.get('email'),
        phone: form.get('phone'),
        address: form.get('address'),
        note: form.get('note'),
        items: cartLines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      }),
    });
    const result = (await response.json()) as {
      orderNumber?: string;
      error?: string;
    };
    setSubmittingOrder(false);
    if (!response.ok || !result.orderNumber) {
      setOrderError(
        result.error ?? 'Nepavyko pateikti užsakymo. Bandykite dar kartą.',
      );
      return;
    }
    setOrderResult({ orderNumber: result.orderNumber });
    setCart({});
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-[1480px] items-center justify-between px-4 sm:h-[88px] sm:px-8 lg:px-12">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full lg:hidden"
            aria-label="Atverti meniu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu />
          </Button>
          <a href="/" aria-label="Sfinksas pradžia" className="shrink-0">
            <img
              src="/sfinksas-logo.png"
              alt="Sfinksas grožio namai"
              className="h-[50px] w-auto mix-blend-multiply sm:h-[60px]"
            />
          </a>
          <nav className="hidden items-center gap-8 text-[12px] font-medium uppercase tracking-[0.12em] lg:flex">
            <a href="/" className="nav-link">
              Naujienos
            </a>
            <a href="/produktai" className="nav-link">
              Produktai
            </a>
            <a href="/apie-mus" className="nav-link">
              Apie mus
            </a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="/admin"
              className="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 sm:flex"
              aria-label="Administravimas"
            >
              <CircleUserRound className="size-4" />
            </a>
            <Button
              variant="ghost"
              size="icon-lg"
              className="relative rounded-full"
              aria-label={`Krepšelis, ${cartCount} prekės`}
              onClick={() => {
                setCheckoutMode(false);
                setCartOpen(true);
              }}
            >
              <ShoppingBag />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-ink text-[9px] text-white">
                {cartCount}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {view === 'home' && (
        <section
          id="pradzia"
          className="relative z-0 min-h-[calc(100svh-82px)] scroll-mt-32 overflow-hidden bg-[#d4ccbf] sm:min-h-[calc(100svh-88px)]"
        >
          <img
            src="/hero-background.png"
            alt="Sfinksas profesionalios plaukų priežiūros kolekcija"
            className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(235,228,216,.97)_0%,rgba(235,228,216,.9)_35%,rgba(235,228,216,.18)_68%,rgba(28,24,20,.12)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-82px)] max-w-[1480px] items-center px-5 pb-28 pt-16 sm:min-h-[calc(100svh-88px)] sm:px-10 lg:px-16 xl:px-20">
            <div className="max-w-[650px]">
              <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#665f54] sm:text-xs">
                <span className="h-px w-10 bg-[#81786a]" aria-hidden="true" />
                Profesionalų atrinkta kolekcija
              </div>
              <h1 className="font-display mt-10 text-[clamp(4rem,7.4vw,7.8rem)] leading-[0.84] tracking-[-0.06em]">
                Ritualas, kurį
                <span className="mt-2 block italic text-[#756d60]">
                  pajusite.
                </span>
              </h1>
              <p className="mt-9 max-w-lg border-l border-black/20 pl-5 text-base leading-7 text-black/65 sm:text-lg">
                Profesionalios priemonės plaukams, kurias kasdien renkasi
                „Sfinksas“ grožio namų meistrai.
              </p>
              <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-black/20 bg-[#eee8de]/45 py-5 backdrop-blur-sm">
                {[
                  [products.length, 'atrinkti produktai'],
                  [brands.length, 'profesionalūs ženklai'],
                  [7, 'kategorijos'],
                ].map(([value, label], index) => (
                  <div
                    key={label}
                    className={
                      index ? 'border-l border-black/15 px-4 sm:px-6' : 'pr-4'
                    }
                  >
                    <strong className="font-display block text-3xl font-normal">
                      {value}
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-black/55 sm:text-sm">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a
            href="#naujienos"
            aria-label="Rodyti meistrų favoritus"
            className="absolute bottom-24 left-1/2 z-20 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/35 bg-black/65 text-white shadow-lg backdrop-blur-sm transition-transform hover:translate-y-1"
          >
            <ChevronDown className="size-5" />
          </a>
        </section>
      )}

      {view === 'catalog' && (
        <section
          id="kategorijos"
          className="scroll-mt-28 border-b border-black/10 bg-[#eee9df] py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-12">
            <div className="mb-12 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/42">
                  <span className="flex size-7 items-center justify-center rounded-full border border-black/15">
                    01
                  </span>
                  Parduotuvė
                </div>
                <h1 className="font-display mt-5 max-w-3xl text-4xl leading-[.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                  Rinkitės pagal kategoriją
                </h1>
              </div>
              <p className="max-w-sm text-sm leading-6 text-black/52 lg:pb-2">
                Pradėkite nuo visos kolekcijos arba pasirinkite tai, ko šiuo
                metu labiausiai reikia jūsų plaukams.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['Visi', ...categoryOrder].map((item, index) => {
                const isAll = item === 'Visi';
                const isActive = category === item;
                return (
                  <button
                    key={item}
                    aria-pressed={isActive}
                    onClick={() => {
                      setCategory(item);
                      setVisibleCount(16);
                      document
                        .querySelector('#zenklai')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`group relative min-h-56 overflow-hidden rounded-2xl p-6 text-left shadow-[0_12px_35px_rgba(54,47,39,.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(54,47,39,.14)] ${categoryTones[index]} ${isActive ? 'ring-2 ring-black ring-offset-2 ring-offset-[#eee9df]' : ''}`}
                  >
                    <div className="absolute -right-14 -top-14 size-40 rounded-full border border-current opacity-[.08] transition-transform duration-500 group-hover:scale-110" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-50">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="rounded-full border border-current px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] opacity-60">
                          {isAll ? products.length : categoryCounts[item]}{' '}
                          prekės
                        </span>
                      </div>
                      <div className="mt-12 flex items-end justify-between gap-5">
                        <div>
                          <h2 className="font-display text-2xl leading-[1.05] sm:text-3xl">
                            {isAll ? 'Visi produktai' : displayCategory(item)}
                          </h2>
                          <p className="mt-3 max-w-[230px] text-xs leading-5 opacity-60">
                            {isAll
                              ? 'Visa profesionalų atrinkta kolekcija'
                              : categoryCopy[item]}
                          </p>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-current opacity-70 transition-transform group-hover:translate-x-1">
                          {isActive ? (
                            <Check className="size-4" />
                          ) : (
                            <ArrowRight className="size-4" />
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {view === 'catalog' && (
        <section
          id="zenklai"
          className="scroll-mt-24 border-b border-black/10 bg-[#28251f] py-16 text-[#f3efe7] lg:py-20"
        >
          <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">
                  <span className="flex size-7 items-center justify-center rounded-full border border-white/20">
                    02
                  </span>
                  Profesionalūs partneriai
                </div>
                <h2 className="font-display mt-5 text-4xl leading-none tracking-tight sm:text-5xl">
                  Tada rinkitės ženklą
                </h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {['Visi', ...brands].map((item) => {
                  const isActive = brand === item;
                  return (
                    <button
                      key={item}
                      aria-pressed={isActive}
                      className={`flex min-h-20 items-center justify-between gap-3 rounded-xl border px-4 text-left font-display text-lg leading-tight transition-all ${isActive ? 'border-white bg-white text-[#28251f]' : 'border-white/15 bg-white/[.03] text-white/75 hover:border-white/40 hover:bg-white/[.07] hover:text-white'}`}
                      onClick={() => {
                        setBrand(item);
                        setVisibleCount(16);
                        document
                          .querySelector('#produktai')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span>{item === 'Visi' ? 'Visi partneriai' : item}</span>
                      {isActive ? (
                        <Check className="size-4 shrink-0" />
                      ) : (
                        <ArrowRight className="size-4 shrink-0 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {view === 'home' && (
        <section
          id="naujienos"
          className="curved-reveal relative z-20 -mt-20 scroll-mt-28 border-b border-black/10 bg-[#f1ede5] pb-20 pt-32 shadow-[0_-24px_60px_rgba(43,37,30,0.14)] lg:-mt-28 lg:pb-28 lg:pt-40"
        >
          <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-12">
            <div className="mb-12 text-center">
              <div className="mx-auto max-w-2xl">
                <p className="eyebrow">Atrinkta jums</p>
                <h2 className="font-display mt-3 text-4xl tracking-tight sm:text-6xl">
                  Meistrų favoritai
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 xl:grid-cols-5 xl:gap-x-5">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={setSelectedProduct}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {view === 'catalog' && (
        <>
          <section
            id="produktai"
            className="mx-auto max-w-[1480px] scroll-mt-28 px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
          >
            <div className="mb-12 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/42">
                  <span className="flex size-7 items-center justify-center rounded-full border border-black/15">
                    03
                  </span>
                  Visas katalogas
                </div>
                <h2 className="font-display mt-5 text-4xl tracking-tight sm:text-6xl">
                  Atraskite savo ritualą
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-black/52 lg:pb-2">
                Paieškoje įveskite produkto pavadinimą arba plaukų poreikį.
                Pasirinkimus visuomet galite pakeisti viršuje.
              </p>
            </div>
            <div className="sticky top-[82px] z-30 -mx-5 mb-10 border-y border-black/10 bg-background/95 px-5 py-4 backdrop-blur-xl sm:top-[88px] sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
              <div className="mx-auto grid max-w-[1384px] gap-3 sm:grid-cols-[minmax(280px,1fr)_220px]">
                <label className="relative block">
                  <span className="sr-only">Ieškoti produktų</span>
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/45" />
                  <Input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setVisibleCount(16);
                    }}
                    placeholder="Ieškoti produkto ar poreikio..."
                    className="h-11 rounded-full border-black/15 bg-white/55 pl-10"
                  />
                </label>
                <FilterSelect
                  label="Rikiavimas"
                  value={sort}
                  onChange={setSort}
                >
                  <option value="recommended">Rekomenduojami</option>
                  <option value="price-asc">Kaina: nuo mažiausios</option>
                  <option value="price-desc">Kaina: nuo didžiausios</option>
                  <option value="name">Pagal pavadinimą</option>
                </FilterSelect>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-black/52">
                  Rasta {filtered.length} produktų
                </span>
                <span className="rounded-full border border-black/15 px-3 py-1 text-xs font-medium">
                  {category === 'Visi'
                    ? 'Visos kategorijos'
                    : displayCategory(category)}
                </span>
                <span className="rounded-full border border-black/15 px-3 py-1 text-xs font-medium">
                  {brand === 'Visi' ? 'Visi partneriai' : brand}
                </span>
              </div>
              {(category !== 'Visi' || brand !== 'Visi' || query) && (
                <button
                  className="font-medium underline underline-offset-4"
                  onClick={() => {
                    setQuery('');
                    setCategory('Visi');
                    setBrand('Visi');
                  }}
                >
                  Išvalyti filtrus
                </button>
              )}
            </div>

            {filtered.length ? (
              <>
                <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
                  {filtered.slice(0, visibleCount).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={setSelectedProduct}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="mt-14 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 rounded-full border-black/20 bg-transparent px-8"
                      onClick={() => setVisibleCount((count) => count + 16)}
                    >
                      Rodyti daugiau <ChevronDown />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="border border-black/12 bg-[#eee9df] px-6 py-20 text-center">
                <SlidersHorizontal className="mx-auto size-7 text-black/35" />
                <h3 className="font-display mt-5 text-3xl">Produktų nerasta</h3>
                <p className="mt-2 text-sm text-black/50">
                  Pakeiskite paiešką arba išvalykite filtrus.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {view === 'about' && (
        <section
          id="apie"
          className="mx-auto grid min-h-[520px] max-w-[1480px] scroll-mt-28 content-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-28"
        >
          <div>
            <p className="eyebrow">Kodėl Sfinksas</p>
            <h1 className="font-display mt-4 max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Profesionalų žinios – jūsų kasdieniam grožiui.
            </h1>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-t border-black/15 pt-5">
              <PackageCheck className="size-5" />
              <h2 className="mt-5 font-medium">Meistrų atranka</h2>
              <p className="mt-2 text-sm leading-6 text-black/52">
                Tik profesionalių salonų patikrintos formulės ir įrankiai.
              </p>
            </div>
            <div className="border-t border-black/15 pt-5">
              <Truck className="size-5" />
              <h2 className="mt-5 font-medium">Pristatymas Lietuvoje</h2>
              <p className="mt-2 text-sm leading-6 text-black/52">
                Užsakymo informaciją patvirtinsime asmeniškai.
              </p>
            </div>
          </div>
        </section>
      )}

      {view === 'about' && (
        <footer className="bg-[#1f1d1a] px-5 py-12 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1384px] gap-10 border-b border-white/15 pb-12 md:grid-cols-[1fr_auto_auto]">
            <div>
              <p className="font-display text-3xl">SFINKSAS</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/45">
                Grožio namai
              </p>
            </div>
            <div className="text-sm leading-8">
              <p className="text-white/45">Parduotuvė</p>
              <a href="/produktai" className="block">
                Visi produktai
              </a>
              <a href="/produktai#kategorijos" className="block">
                Kategorijos
              </a>
            </div>
            <div className="text-sm leading-8">
              <p className="text-white/45">Valdymas</p>
              <a href="/admin" className="block">
                Administratoriaus puslapis
              </a>
              <p>Vilnius · Lietuva</p>
            </div>
          </div>
          <div className="mx-auto flex max-w-[1384px] flex-col gap-3 pt-6 text-xs text-white/38 sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} Sfinksas grožio namai</p>
            <p>Profesionali plaukų priežiūra</p>
          </div>
        </footer>
      )}

      <ProductDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={addToCart}
      />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[88%] bg-[#f4f0e8] p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-black/10 p-6">
            <SheetTitle className="font-display text-2xl">SFINKSAS</SheetTitle>
            <SheetDescription>Profesionali plaukų priežiūra</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col px-6 py-8 font-display text-3xl">
            {[
              ['Naujienos', '/'],
              ['Produktai', '/produktai'],
              ['Apie mus', '/apie-mus'],
              ['Administravimas', '/admin'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="border-b border-black/10 py-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="w-full bg-[#f6f2ea] p-0 sm:max-w-lg"
        >
          <SheetHeader className="border-b border-black/10 p-6 pr-14">
            <SheetTitle className="font-display text-3xl">
              {checkoutMode ? 'Užsakymo duomenys' : `Krepšelis · ${cartCount}`}
            </SheetTitle>
            <SheetDescription>
              {checkoutMode
                ? 'Užpildykite pristatymo informaciją.'
                : 'Jūsų atrinkti profesionalūs produktai.'}
            </SheetDescription>
          </SheetHeader>
          {orderResult ? (
            <div className="m-auto max-w-sm px-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#dce4d6]">
                <Check className="size-6" />
              </div>
              <h3 className="font-display mt-6 text-4xl">Užsakymas gautas</h3>
              <p className="mt-4 text-sm leading-6 text-black/55">
                Jūsų užsakymo numeris{' '}
                <strong className="text-black">
                  {orderResult.orderNumber}
                </strong>
                . Susisieksime dėl apmokėjimo ir pristatymo.
              </p>
              <Button
                className="mt-8 h-11 rounded-full px-6"
                onClick={() => {
                  setCartOpen(false);
                  setOrderResult(null);
                  setCheckoutMode(false);
                }}
              >
                Tęsti apsipirkimą
              </Button>
            </div>
          ) : checkoutMode ? (
            <form
              onSubmit={submitOrder}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-4 overflow-y-auto p-6">
                <FormField
                  label="Vardas ir pavardė"
                  name="customerName"
                  autoComplete="name"
                  required
                />
                <FormField
                  label="El. paštas"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
                <FormField
                  label="Telefono numeris"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                />
                <FormField
                  label="Pristatymo adresas"
                  name="address"
                  autoComplete="street-address"
                  required
                />
                <label className="block text-sm">
                  <span className="mb-2 block font-medium">Pastaba</span>
                  <Textarea
                    name="note"
                    rows={4}
                    className="rounded-xl border-black/15 bg-white/55"
                    placeholder="Papildoma informacija kurjeriui ar salonui"
                  />
                </label>
                {orderError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {orderError}
                  </p>
                )}
              </div>
              <div className="mt-auto border-t border-black/10 bg-white/35 p-6">
                <div className="mb-4 flex justify-between text-sm">
                  <span>Iš viso</span>
                  <strong className="text-lg">{formatPrice(cartTotal)}</strong>
                </div>
                <Button
                  type="submit"
                  disabled={submittingOrder}
                  className="h-12 w-full rounded-full text-sm"
                >
                  {submittingOrder ? 'Siunčiama...' : 'Pateikti užsakymą'}{' '}
                  <ArrowRight />
                </Button>
                <button
                  type="button"
                  className="mt-4 w-full text-sm underline underline-offset-4"
                  onClick={() => setCheckoutMode(false)}
                >
                  Grįžti į krepšelį
                </button>
              </div>
            </form>
          ) : cartLines.length ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="space-y-5 overflow-y-auto p-6">
                {cartLines.map((line) => (
                  <div
                    key={line.product.id}
                    className="grid grid-cols-[86px_1fr] gap-4 border-b border-black/10 pb-5"
                  >
                    <div className="group aspect-[4/5] overflow-hidden">
                      <ProductVisual product={line.product} compact />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-black/43">
                        {line.product.brand}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm leading-5">
                        {line.product.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-black/15 bg-white/45">
                          <button
                            className="flex size-8 items-center justify-center"
                            aria-label="Sumažinti kiekį"
                            onClick={() =>
                              changeQuantity(line.product.id, line.quantity - 1)
                            }
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-7 text-center text-xs">
                            {line.quantity}
                          </span>
                          <button
                            className="flex size-8 items-center justify-center"
                            aria-label="Padidinti kiekį"
                            onClick={() =>
                              changeQuantity(line.product.id, line.quantity + 1)
                            }
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <strong className="text-sm font-medium">
                          {formatPrice(line.product.priceCents * line.quantity)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t border-black/10 bg-white/35 p-6">
                <div className="mb-4 flex justify-between text-sm">
                  <span>Iš viso</span>
                  <strong className="text-lg">{formatPrice(cartTotal)}</strong>
                </div>
                <Button
                  className="h-12 w-full rounded-full text-sm"
                  onClick={() => setCheckoutMode(true)}
                >
                  Tęsti užsakymą <ArrowRight />
                </Button>
                <p className="mt-3 text-center text-[11px] leading-4 text-black/42">
                  Apmokėjimo ir pristatymo detales patvirtinsime susisiekę su
                  jumis.
                </p>
              </div>
            </div>
          ) : (
            <div className="m-auto max-w-xs px-8 text-center">
              <ShoppingBag className="mx-auto size-8 text-black/32" />
              <h3 className="font-display mt-5 text-3xl">Krepšelis tuščias</h3>
              <p className="mt-2 text-sm leading-6 text-black/50">
                Atraskite profesionalų atrinktą plaukų priežiūrą.
              </p>
              <Button
                className="mt-7 rounded-full px-6"
                onClick={() => setCartOpen(false)}
              >
                Rinktis produktus
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}

function ProductCard({
  product,
  onOpen,
  onAdd,
}: {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
}) {
  return (
    <article className="group min-w-0">
      <button
        onClick={() => onOpen(product)}
        className="relative block w-full overflow-hidden text-left"
      >
        <div className="aspect-[4/5] overflow-hidden">
          <ProductVisual product={product} />
        </div>
        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/82 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm sm:left-4 sm:top-4">
            Rekomenduojame
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex size-9 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowRight className="size-4" />
        </span>
      </button>
      <div className="pt-4">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-black/43 sm:text-[10px]">
          {product.brand}
        </p>
        <button
          onClick={() => onOpen(product)}
          className="mt-2 min-h-12 text-left text-sm leading-5 sm:text-[15px]"
        >
          {product.name}
        </button>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <strong className="font-medium">
            {formatPrice(product.priceCents)}
          </strong>
          <span className="text-xs text-black/43">{product.size}</span>
        </div>
        <Button
          variant="outline"
          className="mt-4 h-9 w-full rounded-full border-black/15 bg-transparent text-xs"
          disabled={product.stock <= 0}
          onClick={() => onAdd(product)}
        >
          {product.stock > 0 ? 'Į krepšelį' : 'Laikinai neturime'} <Plus />
        </Button>
      </div>
    </article>
  );
}

function ProductDialog({
  product,
  onClose,
  onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
}) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      {product && (
        <DialogContent className="max-h-[92svh] max-w-[920px] gap-0 overflow-y-auto rounded-xl border-0 bg-[#f6f2ea] p-0 shadow-[0_32px_100px_rgba(20,18,15,.32)] md:overflow-hidden">
          <div className="grid md:max-h-[88svh] md:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
            <div className="group h-[240px] overflow-hidden border-b border-black/10 sm:h-[300px] md:h-[min(680px,88svh)] md:border-b-0 md:border-r">
              <ProductVisual product={product} detail />
            </div>
            <div className="md:h-[min(680px,88svh)] md:overflow-y-auto">
              <div className="p-5 sm:p-7 lg:p-8">
                <DialogHeader className="pr-8">
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/52 sm:text-[10px]">
                    <span className="rounded-full border border-black/15 px-3 py-1.5">
                      {product.brand}
                    </span>
                    <span className="rounded-full bg-[#e4ddd1] px-3 py-1.5">
                      {displayCategory(product.category)}
                    </span>
                  </div>
                  <DialogTitle className="font-display mt-3 text-2xl leading-[1.08] tracking-[-0.02em] sm:text-3xl lg:text-4xl">
                    {product.name}
                  </DialogTitle>
                  <p className="text-xs uppercase tracking-[0.12em] text-black/42">
                    {product.productType}
                  </p>
                  <DialogDescription className="sr-only">
                    {product.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/50 p-4">
                  <div>
                    <strong className="font-display text-2xl font-normal">
                      {formatPrice(product.priceCents)}
                    </strong>
                    {product.unitPrice && (
                      <p className="mt-1 text-xs text-black/42">
                        {product.unitPrice}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full border border-black/15 px-3 py-1.5 text-sm text-black/62">
                    {product.size}
                  </span>
                </div>

                <section className="mt-6">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.17em] text-black/42">
                    Aprašymas
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-black/68">
                    {product.description}
                  </p>
                </section>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {product.hairNeed && (
                    <div className="border-t border-black/15 pt-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-black/40">
                        Plaukų poreikis
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {product.hairNeed}
                      </p>
                    </div>
                  )}
                  {product.origin && (
                    <div className="border-t border-black/15 pt-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-black/40">
                        Kilmė
                      </p>
                      <p className="mt-2 text-sm leading-6">{product.origin}</p>
                    </div>
                  )}
                  <div className="border-t border-black/15 pt-4 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-black/40">
                      Prieinamumas
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm leading-6">
                      <span
                        className={`size-2 rounded-full ${product.stock > 0 ? 'bg-emerald-600' : 'bg-black/25'}`}
                      />
                      {product.stock > 0
                        ? `Turime sandėlyje · ${product.stock} vnt.`
                        : 'Laikinai neturime'}
                    </p>
                  </div>
                </div>

                {product.usage && (
                  <section className="mt-6 rounded-lg bg-[#e9e2d7] p-4">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.17em] text-black/45">
                      Naudojimas
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-black/65">
                      {product.usage}
                    </p>
                  </section>
                )}

                {product.ingredients && (
                  <section className="mt-6">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.17em] text-black/42">
                      Sudėtis
                    </h3>
                    <p className="mt-3 text-xs leading-6 text-black/52">
                      {product.ingredients}
                    </p>
                  </section>
                )}

                <div className="sticky -bottom-px mt-6 border-t border-black/10 bg-[#f6f2ea]/95 pb-1 pt-4 backdrop-blur-xl">
                  <Button
                    className="h-12 w-full rounded-full text-sm"
                    disabled={product.stock <= 0}
                    onClick={() => onAdd(product)}
                  >
                    {product.stock > 0 ? 'Į krepšelį' : 'Laikinai neturime'}{' '}
                    <ShoppingBag />
                  </Button>
                  <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-black/42">
                    <Heart className="size-3.5" /> Sfinksas meistrų atrinkta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-full border border-black/15 bg-white/55 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-black/15"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-black/43" />
    </label>
  );
}

function FormField({
  label,
  ...props
}: React.ComponentProps<'input'> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      <Input
        {...props}
        className="h-11 rounded-xl border-black/15 bg-white/55"
      />
    </label>
  );
}

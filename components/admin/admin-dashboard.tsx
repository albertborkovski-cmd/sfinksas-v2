'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  CircleDollarSign,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { OrderSummary, Product } from '@/lib/types';
import { formatPrice, productImageUrl } from '@/lib/types';

const categories = [
  'Plaukų priežiūra',
  'Stiliaus formavimas',
  'Aksesuaras',
  'Elektroninis įrankis',
  'Rinkinys',
  'Kvepalai',
  'Maisto papildas',
];

const emptyProduct: Product = {
  id: '',
  slug: '',
  name: '',
  productType: '',
  brand: '',
  size: '',
  priceCents: 0,
  unitPrice: '',
  category: 'Plaukų priežiūra',
  hairNeed: '',
  sizeCategory: '',
  origin: '',
  ingredients: '',
  usage: '',
  description: '',
  imageKey: null,
  stock: 0,
  isFeatured: false,
  status: 'active',
};

export function AdminDashboard({
  initialProducts,
  initialOrders,
  user,
  signOutPath,
}: {
  initialProducts: Product[];
  initialOrders: OrderSummary[];
  user: { displayName: string; email: string };
  signOutPath: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [orders] = useState(initialOrders);
  const [section, setSection] = useState<'products' | 'orders'>('products');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('lt-LT');
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.brand, product.category, product.productType]
        .join(' ')
        .toLocaleLowerCase('lt-LT')
        .includes(normalized),
    );
  }, [products, query]);

  const activeCount = products.filter(
    (product) => product.status === 'active',
  ).length;
  const lowStockCount = products.filter((product) => product.stock < 10).length;
  const catalogValue = products.reduce(
    (total, product) => total + product.priceCents * product.stock,
    0,
  );

  function updateEditing<K extends keyof Product>(key: K, value: Product[K]) {
    setEditing((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError('');
    const isNew = !editing.id;
    const response = await fetch(
      isNew ? '/api/products' : `/api/products/${editing.id}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editing),
      },
    );
    const result = (await response.json()) as {
      product?: Product;
      error?: string;
    };
    setSaving(false);
    if (!response.ok || !result.product) {
      setFormError(result.error ?? 'Nepavyko išsaugoti produkto.');
      return;
    }
    setProducts((current) =>
      isNew
        ? [result.product!, ...current]
        : current.map((product) =>
            product.id === result.product!.id ? result.product! : product,
          ),
    );
    setEditing(null);
  }

  async function uploadImage(file: File) {
    if (!editing) return;
    setUploading(true);
    setFormError('');
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/uploads', { method: 'POST', body });
    const result = (await response.json()) as { key?: string; error?: string };
    setUploading(false);
    if (!response.ok || !result.key) {
      setFormError(result.error ?? 'Nepavyko įkelti nuotraukos.');
      return;
    }
    updateEditing('imageKey', result.key);
  }

  async function removeProduct(product: Product) {
    if (
      !window.confirm(
        `Ištrinti „${product.name}“? Šio veiksmo atšaukti negalima.`,
      )
    )
      return;
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
    });
    if (response.ok)
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
  }

  return (
    <main className="min-h-screen bg-[#eeebe4] text-[#23211e]">
      <header className="border-b border-black/10 bg-[#f7f4ed]">
        <div className="mx-auto flex h-20 max-w-[1540px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-5">
            <a
              href="/"
              className="flex size-9 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Grįžti į parduotuvę"
            >
              <ArrowLeft className="size-4" />
            </a>
            <div>
              <p className="font-display text-2xl leading-none">SFINKSAS</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.2em] text-black/40">
                Administravimas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-[11px] text-black/43">{user.email}</p>
            </div>
            <a
              href={signOutPath}
              className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/45"
              aria-label="Atsijungti"
            >
              <LogOut className="size-4" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] lg:grid-cols-[230px_1fr]">
        <aside className="hidden min-h-[calc(100vh-80px)] border-r border-black/10 bg-[#f7f4ed] p-5 lg:block">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-black/38">
            Valdymas
          </p>
          <nav className="space-y-1">
            <AdminNav
              active={section === 'products'}
              icon={<Package />}
              label="Produktai"
              count={products.length}
              onClick={() => setSection('products')}
            />
            <AdminNav
              active={section === 'orders'}
              icon={<ShoppingBag />}
              label="Užsakymai"
              count={orders.length}
              onClick={() => setSection('orders')}
            />
          </nav>
          <a
            href="/"
            className="mt-8 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-black/55 hover:bg-black/5"
          >
            <ExternalLink className="size-4" /> Atverti parduotuvę
          </a>
        </aside>

        <div className="min-w-0 p-5 sm:p-8 lg:p-10 xl:p-12">
          <div className="mb-7 flex gap-2 lg:hidden">
            <Button
              variant={section === 'products' ? 'default' : 'outline'}
              onClick={() => setSection('products')}
            >
              Produktai
            </Button>
            <Button
              variant={section === 'orders' ? 'default' : 'outline'}
              onClick={() => setSection('orders')}
            >
              Užsakymai
            </Button>
          </div>

          {section === 'products' ? (
            <>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="eyebrow">Katalogo valdymas</p>
                  <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
                    Produktai
                  </h1>
                  <p className="mt-2 text-sm text-black/48">
                    Kurkite, redaguokite, aprašykite ir papildykite produktų
                    nuotraukas.
                  </p>
                </div>
                <Button
                  className="h-11 rounded-full px-6"
                  onClick={() => setEditing({ ...emptyProduct })}
                >
                  <Plus /> Naujas produktas
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={<Boxes />}
                  label="Visi produktai"
                  value={products.length.toString()}
                />
                <Metric
                  icon={<Package />}
                  label="Aktyvūs"
                  value={activeCount.toString()}
                />
                <Metric
                  icon={<LayoutDashboard />}
                  label="Mažas likutis"
                  value={lowStockCount.toString()}
                />
                <Metric
                  icon={<CircleDollarSign />}
                  label="Sandėlio vertė"
                  value={formatPrice(catalogValue)}
                />
              </div>

              <section className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-[0_12px_40px_rgba(35,31,25,.04)]">
                <div className="flex flex-col gap-4 border-b border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="relative max-w-md flex-1">
                    <span className="sr-only">Ieškoti produktų</span>
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/38" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Ieškoti pavadinimo, ženklo ar kategorijos..."
                      className="h-10 rounded-full border-black/12 bg-white pl-10"
                    />
                  </label>
                  <p className="text-xs text-black/42">
                    Rodoma {filteredProducts.length} iš {products.length}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/[.025]">
                      <TableHead className="w-[46%] px-5">Produktas</TableHead>
                      <TableHead>Ženklas</TableHead>
                      <TableHead>Kategorija</TableHead>
                      <TableHead>Kaina</TableHead>
                      <TableHead>Likutis</TableHead>
                      <TableHead>Būsena</TableHead>
                      <TableHead className="w-24 text-right">
                        Veiksmai
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="px-5 py-3">
                          <div className="flex min-w-[260px] items-center gap-3">
                            <AdminProductThumb product={product} />
                            <div className="min-w-0">
                              <p className="max-w-[360px] truncate font-medium">
                                {product.name}
                              </p>
                              <p className="mt-1 text-[11px] text-black/42">
                                {product.productType} ·{' '}
                                {product.size || 'Talpa nenurodyta'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(product.priceCents)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stock < 10 ? 'text-[#a04a31]' : ''
                            }
                          >
                            {product.stock} vnt.
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.1em] ${product.status === 'active' ? 'bg-[#e3e9dd] text-[#425238]' : 'bg-black/7 text-black/50'}`}
                          >
                            {product.status === 'active'
                              ? 'Aktyvus'
                              : 'Juodraštis'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Redaguoti"
                              onClick={() => setEditing({ ...product })}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Ištrinti"
                              className="text-red-700"
                              onClick={() => removeProduct(product)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!filteredProducts.length && (
                  <div className="px-6 py-16 text-center text-sm text-black/45">
                    Produktų pagal šią paiešką nėra.
                  </div>
                )}
              </section>
            </>
          ) : (
            <OrdersView orders={orders} />
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing && (
          <DialogContent className="max-h-[94vh] max-w-4xl overflow-y-auto bg-[#f8f5ee] p-0">
            <form onSubmit={save}>
              <DialogHeader className="border-b border-black/10 px-6 py-5 sm:px-8">
                <DialogTitle className="font-display text-3xl">
                  {editing.id ? 'Redaguoti produktą' : 'Naujas produktas'}
                </DialogTitle>
                <DialogDescription>
                  Užpildykite pagrindinę informaciją, aprašymą ir įkelkite
                  produkto nuotrauką.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[220px_1fr]">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-black/45">
                    Nuotrauka
                  </p>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-dashed border-black/20 bg-[#ded8cd]">
                    {editing.imageKey ? (
                      <img
                        src={productImageUrl(editing) ?? ''}
                        alt="Produkto peržiūra"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                        <ImagePlus className="size-7 text-black/35" />
                        <p className="mt-3 text-xs leading-5 text-black/42">
                          JPG, PNG, WEBP, GIF arba AVIF iki 8 MB
                        </p>
                      </div>
                    )}
                  </div>
                  <label className="mt-3 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/15 bg-white text-xs font-medium hover:bg-black/[.03]">
                    <Upload className="size-3.5" />{' '}
                    {uploading ? 'Įkeliama...' : 'Įkelti nuotrauką'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      className="sr-only"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadImage(file);
                      }}
                    />
                  </label>
                  {editing.imageKey && (
                    <button
                      type="button"
                      className="mt-3 w-full text-xs text-red-700 underline underline-offset-4"
                      onClick={() => updateEditing('imageKey', null)}
                    >
                      Pašalinti nuotrauką
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField
                      label="Pavadinimas"
                      value={editing.name}
                      required
                      onChange={(value) => updateEditing('name', value)}
                      className="sm:col-span-2"
                    />
                    <AdminField
                      label="Prekės ženklas"
                      value={editing.brand}
                      required
                      onChange={(value) => updateEditing('brand', value)}
                    />
                    <AdminField
                      label="Produkto tipas"
                      value={editing.productType}
                      onChange={(value) => updateEditing('productType', value)}
                    />
                    <AdminSelect
                      label="Kategorija"
                      value={editing.category}
                      onChange={(value) => updateEditing('category', value)}
                      options={categories}
                    />
                    <AdminField
                      label="Plaukų poreikis"
                      value={editing.hairNeed}
                      onChange={(value) => updateEditing('hairNeed', value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <AdminField
                      label="Kaina (€)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={(editing.priceCents / 100).toString()}
                      required
                      onChange={(value) =>
                        updateEditing(
                          'priceCents',
                          Math.round(Number(value) * 100),
                        )
                      }
                    />
                    <AdminField
                      label="Kiekis / talpa"
                      value={editing.size}
                      onChange={(value) => updateEditing('size', value)}
                    />
                    <AdminField
                      label="Likutis"
                      type="number"
                      min="0"
                      step="1"
                      value={editing.stock.toString()}
                      required
                      onChange={(value) =>
                        updateEditing('stock', Number(value))
                      }
                    />
                  </div>
                  <AdminTextarea
                    label="Aprašymas"
                    value={editing.description}
                    rows={5}
                    onChange={(value) => updateEditing('description', value)}
                  />
                  <AdminTextarea
                    label="Naudojimas"
                    value={editing.usage}
                    rows={4}
                    onChange={(value) => updateEditing('usage', value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField
                      label="Kilmės šalis"
                      value={editing.origin}
                      onChange={(value) => updateEditing('origin', value)}
                    />
                    <AdminField
                      label="Kaina/ml arba /g"
                      value={editing.unitPrice}
                      onChange={(value) => updateEditing('unitPrice', value)}
                    />
                    <AdminField
                      label="Talpos kategorija"
                      value={editing.sizeCategory}
                      onChange={(value) => updateEditing('sizeCategory', value)}
                    />
                    <AdminSelect
                      label="Būsena"
                      value={editing.status}
                      onChange={(value) =>
                        updateEditing('status', value as Product['status'])
                      }
                      options={['active', 'draft']}
                      optionLabels={{ active: 'Aktyvus', draft: 'Juodraštis' }}
                    />
                  </div>
                  <AdminTextarea
                    label="INCI sudėtis"
                    value={editing.ingredients}
                    rows={3}
                    onChange={(value) => updateEditing('ingredients', value)}
                  />
                  <label className="flex items-center justify-between rounded-xl border border-black/10 bg-white/50 px-4 py-3">
                    <span>
                      <strong className="block text-sm font-medium">
                        Rodyti tarp favoritų
                      </strong>
                      <span className="text-xs text-black/43">
                        Produktas bus iškeltas parduotuvės pradžioje.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={editing.isFeatured}
                      onChange={(event) =>
                        updateEditing('isFeatured', event.target.checked)
                      }
                      className="size-4 accent-black"
                    />
                  </label>
                  {formError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {formError}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="mx-0 mb-0 rounded-none border-black/10 bg-[#efebe3] px-6 py-4 sm:px-8">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setEditing(null)}
                >
                  Atšaukti
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-full px-6"
                >
                  {saving ? 'Saugoma...' : 'Išsaugoti produktą'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}

function AdminNav({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? 'bg-[#24211d] text-white' : 'text-black/58 hover:bg-black/5'}`}
    >
      <span className="[&_svg]:size-4">{icon}</span>
      <span>{label}</span>
      <span
        className={`ml-auto text-xs ${active ? 'text-white/45' : 'text-black/35'}`}
      >
        {count}
      </span>
    </button>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f8f5ee] p-5">
      <div className="flex items-center gap-2 text-black/42 [&_svg]:size-4">
        <span>{icon}</span>
        <span className="text-xs uppercase tracking-[.1em]">{label}</span>
      </div>
      <strong className="mt-5 block text-2xl font-medium tracking-tight">
        {value}
      </strong>
    </div>
  );
}

function AdminProductThumb({ product }: { product: Product }) {
  const url = productImageUrl(product);
  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#d8d2c7]">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-black/35">
          {product.brand.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function OrdersView({ orders }: { orders: OrderSummary[] }) {
  return (
    <>
      <div>
        <p className="eyebrow">Užsakymų valdymas</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
          Užsakymai
        </h1>
        <p className="mt-2 text-sm text-black/48">
          Parduotuvėje pateiktos užsakymo užklausos.
        </p>
      </div>
      <section className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5">Numeris</TableHead>
              <TableHead>Klientas</TableHead>
              <TableHead>Kontaktai</TableHead>
              <TableHead>Prekių</TableHead>
              <TableHead>Suma</TableHead>
              <TableHead>Būsena</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{order.customerName}</p>
                    <p className="mt-1 max-w-[240px] truncate text-xs text-black/42">
                      {order.address}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{order.email}</p>
                    <p className="mt-1 text-xs text-black/42">{order.phone}</p>
                  </div>
                </TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell className="font-medium">
                  {formatPrice(order.totalCents)}
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-[#e6dfcf] px-2.5 py-1 text-[10px] uppercase tracking-[.1em]">
                    Naujas
                  </span>
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat('lt-LT', {
                    dateStyle: 'medium',
                  }).format(new Date(order.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!orders.length && (
          <div className="px-6 py-20 text-center">
            <ShoppingBag className="mx-auto size-7 text-black/28" />
            <h3 className="font-display mt-4 text-3xl">Užsakymų dar nėra</h3>
            <p className="mt-2 text-sm text-black/43">
              Naujos užklausos atsiras šiame sąraše.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function AdminField({
  label,
  value,
  onChange,
  className = '',
  ...props
}: Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-2 block font-medium">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border-black/15 bg-white/60"
        {...props}
      />
    </label>
  );
}

function AdminTextarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="rounded-xl border-black/15 bg-white/60"
      />
    </label>
  );
}

function AdminSelect({
  label,
  value,
  onChange,
  options,
  optionLabels = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  optionLabels?: Record<string, string>;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-black/15 bg-white/60 px-3 text-sm outline-none focus:ring-2 focus:ring-black/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

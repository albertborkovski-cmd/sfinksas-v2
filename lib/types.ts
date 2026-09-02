export type ProductStatus = 'active' | 'draft';

export type Product = {
  id: string;
  slug: string;
  name: string;
  productType: string;
  brand: string;
  size: string;
  priceCents: number;
  unitPrice: string;
  category: string;
  hairNeed: string;
  sizeCategory: string;
  origin: string;
  ingredients: string;
  usage: string;
  description: string;
  imageKey: string | null;
  stock: number;
  isFeatured: boolean;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  totalCents: number;
  status: string;
  createdAt: string;
  itemCount: number;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export function productImageUrl(product: Pick<Product, 'imageKey'>) {
  return product.imageKey
    ? `/api/files/${product.imageKey.split('/').map(encodeURIComponent).join('/')}`
    : null;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

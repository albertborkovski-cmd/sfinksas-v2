import { env } from 'cloudflare:workers';

import seedProductsJson from '@/data/seed-products.json';
import type { OrderSummary, Product, ProductStatus } from '@/lib/types';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  product_type: string;
  brand: string;
  size: string;
  price_cents: number;
  unit_price: string;
  category: string;
  hair_need: string;
  size_category: string;
  origin: string;
  ingredients: string;
  usage: string;
  description: string;
  image_key: string | null;
  stock: number;
  is_featured: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    brand TEXT NOT NULL,
    size TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    unit_price TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    hair_need TEXT NOT NULL DEFAULT '',
    size_category TEXT NOT NULL DEFAULT '',
    origin TEXT NOT NULL DEFAULT '',
    ingredients TEXT NOT NULL DEFAULT '',
    usage TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image_key TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_status_category ON products(status, category)`,
  `CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
];

let initialization: Promise<void> | null = null;

function getD1() {
  if (!env.DB) throw new Error('D1 duomenų bazė nepasiekiama.');
  return env.DB;
}

export function seedProducts(): Product[] {
  return seedProductsJson.map((product) => ({
    ...product,
    status: product.status as ProductStatus,
  }));
}

export async function ensureDatabase() {
  if (!initialization) {
    initialization = initializeDatabase().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  await initialization;
}

async function initializeDatabase() {
  const db = getD1();
  await db.batch(schemaStatements.map((statement) => db.prepare(statement)));

  const count = await db
    .prepare('SELECT COUNT(*) AS count FROM products')
    .first<{ count: number }>();
  if ((count?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    const inserts = seedProducts().map((product) =>
      db
        .prepare(
          `INSERT INTO products (
            id, slug, name, product_type, brand, size, price_cents, unit_price,
            category, hair_need, size_category, origin, ingredients, usage,
            description, image_key, stock, is_featured, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          product.id,
          product.slug,
          product.name,
          product.productType,
          product.brand,
          product.size,
          product.priceCents,
          product.unitPrice,
          product.category,
          product.hairNeed,
          product.sizeCategory,
          product.origin,
          product.ingredients,
          product.usage,
          product.description,
          product.imageKey,
          product.stock,
          product.isFeatured ? 1 : 0,
          product.status,
          now,
          now,
        ),
    );

    for (let index = 0; index < inserts.length; index += 40) {
      await db.batch(inserts.slice(index, index + 40));
    }
  }

  await db.prepare('PRAGMA optimize').run();
}

function fromProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    productType: row.product_type,
    brand: row.brand,
    size: row.size,
    priceCents: row.price_cents,
    unitPrice: row.unit_price,
    category: row.category,
    hairNeed: row.hair_need,
    sizeCategory: row.size_category,
    origin: row.origin,
    ingredients: row.ingredients,
    usage: row.usage,
    description: row.description,
    imageKey: row.image_key,
    stock: row.stock,
    isFeatured: Boolean(row.is_featured),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProducts(includeDrafts = false): Promise<Product[]> {
  await ensureDatabase();
  const db = getD1();
  const query = includeDrafts
    ? 'SELECT * FROM products ORDER BY updated_at DESC, name ASC'
    : "SELECT * FROM products WHERE status = 'active' ORDER BY is_featured DESC, name ASC";
  const result = await db.prepare(query).all<ProductRow>();
  return result.results.map(fromProductRow);
}

export async function saveProduct(product: Product) {
  await ensureDatabase();
  const db = getD1();
  const now = new Date().toISOString();
  const id = product.id || crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO products (
        id, slug, name, product_type, brand, size, price_cents, unit_price,
        category, hair_need, size_category, origin, ingredients, usage,
        description, image_key, stock, is_featured, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        name = excluded.name,
        product_type = excluded.product_type,
        brand = excluded.brand,
        size = excluded.size,
        price_cents = excluded.price_cents,
        unit_price = excluded.unit_price,
        category = excluded.category,
        hair_need = excluded.hair_need,
        size_category = excluded.size_category,
        origin = excluded.origin,
        ingredients = excluded.ingredients,
        usage = excluded.usage,
        description = excluded.description,
        image_key = excluded.image_key,
        stock = excluded.stock,
        is_featured = excluded.is_featured,
        status = excluded.status,
        updated_at = excluded.updated_at`,
    )
    .bind(
      id,
      product.slug,
      product.name,
      product.productType,
      product.brand,
      product.size,
      product.priceCents,
      product.unitPrice,
      product.category,
      product.hairNeed,
      product.sizeCategory,
      product.origin,
      product.ingredients,
      product.usage,
      product.description,
      product.imageKey,
      product.stock,
      product.isFeatured ? 1 : 0,
      product.status,
      product.createdAt ?? now,
      now,
    )
    .run();

  return id;
}

export async function deleteProduct(id: string) {
  await ensureDatabase();
  await getD1().prepare('DELETE FROM products WHERE id = ?').bind(id).run();
}

export async function claimOrVerifyAdmin(userId: string) {
  await ensureDatabase();
  const db = getD1();
  await db
    .prepare(
      `INSERT INTO site_settings (key, value)
       SELECT 'admin_user_id', ?
       WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'admin_user_id')`,
    )
    .bind(userId)
    .run();
  const setting = await db
    .prepare("SELECT value FROM site_settings WHERE key = 'admin_user_id'")
    .first<{ value: string }>();
  return setting?.value === userId;
}

export async function listOrders(): Promise<OrderSummary[]> {
  await ensureDatabase();
  const result = await getD1()
    .prepare(
      `SELECT o.*, COALESCE(SUM(oi.quantity), 0) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
    )
    .all<{
      id: string;
      order_number: string;
      customer_name: string;
      email: string;
      phone: string;
      address: string;
      note: string;
      total_cents: number;
      status: string;
      created_at: string;
      item_count: number;
    }>();

  return result.results.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    note: row.note,
    totalCents: row.total_cents,
    status: row.status,
    createdAt: row.created_at,
    itemCount: row.item_count,
  }));
}

export async function createOrder(input: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  items: { productId: string; quantity: number }[];
}) {
  await ensureDatabase();
  const db = getD1();
  const ids = [...new Set(input.items.map((item) => item.productId))];
  const placeholders = ids.map(() => '?').join(', ');
  const productResult = await db
    .prepare(
      `SELECT * FROM products WHERE status = 'active' AND id IN (${placeholders})`,
    )
    .bind(...ids)
    .all<ProductRow>();
  const productById = new Map(
    productResult.results.map((row) => [row.id, fromProductRow(row)]),
  );

  const lines = input.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) throw new Error('Vienas iš pasirinktų produktų neberastas.');
    const quantity = Math.max(1, Math.min(20, Math.floor(item.quantity)));
    return { product, quantity };
  });
  const totalCents = lines.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  );
  const id = crypto.randomUUID();
  const stamp = new Date();
  const compactDate = stamp.toISOString().slice(2, 10).replaceAll('-', '');
  const orderNumber = `SF-${compactDate}-${id.slice(0, 4).toUpperCase()}`;

  const statements = [
    db
      .prepare(
        `INSERT INTO orders (
          id, order_number, customer_name, email, phone, address, note,
          total_cents, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      )
      .bind(
        id,
        orderNumber,
        input.customerName,
        input.email,
        input.phone,
        input.address,
        input.note,
        totalCents,
        stamp.toISOString(),
      ),
    ...lines.map((line) =>
      db
        .prepare(
          `INSERT INTO order_items (
            id, order_id, product_id, product_name, quantity, unit_price_cents
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          id,
          line.product.id,
          line.product.name,
          line.quantity,
          line.product.priceCents,
        ),
    ),
  ];
  await db.batch(statements);

  return { id, orderNumber, totalCents };
}

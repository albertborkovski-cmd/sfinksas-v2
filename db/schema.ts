import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    productType: text('product_type').notNull(),
    brand: text('brand').notNull(),
    size: text('size').notNull(),
    priceCents: integer('price_cents').notNull(),
    unitPrice: text('unit_price').notNull().default(''),
    category: text('category').notNull(),
    hairNeed: text('hair_need').notNull().default(''),
    sizeCategory: text('size_category').notNull().default(''),
    origin: text('origin').notNull().default(''),
    ingredients: text('ingredients').notNull().default(''),
    usage: text('usage').notNull().default(''),
    description: text('description').notNull().default(''),
    imageKey: text('image_key'),
    stock: integer('stock').notNull().default(0),
    isFeatured: integer('is_featured', { mode: 'boolean' })
      .notNull()
      .default(false),
    status: text('status').notNull().default('active'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_products_status_category').on(table.status, table.category),
    index('idx_products_brand').on(table.brand),
    index('idx_products_updated_at').on(table.updatedAt),
  ],
);

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    customerName: text('customer_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    address: text('address').notNull(),
    note: text('note').notNull().default(''),
    totalCents: integer('total_cents').notNull(),
    status: text('status').notNull().default('new'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_orders_created_at').on(table.createdAt)],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id').notNull(),
    productId: text('product_id').notNull(),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceCents: integer('unit_price_cents').notNull(),
  },
  (table) => [index('idx_order_items_order_id').on(table.orderId)],
);

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

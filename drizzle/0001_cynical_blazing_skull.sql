CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_created_at` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_products_status_category` ON `products` (`status`,`category`);--> statement-breakpoint
CREATE INDEX `idx_products_brand` ON `products` (`brand`);--> statement-breakpoint
CREATE INDEX `idx_products_updated_at` ON `products` (`updated_at`);
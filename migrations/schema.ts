import { pgTable, serial, text, timestamp, index, uniqueIndex, boolean, foreignKey, integer, numeric, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const contacts = pgTable("contacts", {
	id: serial().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	phone: text(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	// Indexes for better query performance
	index("contacts_email_idx").on(table.email),
	index("contacts_created_at_idx").on(table.createdAt),
	index("contacts_name_idx").on(table.firstName, table.lastName),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	isPopular: boolean("is_popular").default(false),
}, (table) => [
	// Performance indexes
	index("products_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("products_name_unique_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("products_popular_idx").using("btree", table.isPopular.asc().nullsLast().op("bool_ops")),
	// Composite index for popular products
	index("products_popular_name_idx").on(table.isPopular, table.name),
]);

export const productVariants = pgTable("product_variants", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	size: text().notNull(),
	price: numeric({ precision: 10, scale: 2 }).notNull(),
	imageUrl: text("image_url").notNull(),
	bestValueBadge: text("best_value_badge"),
	sku: text(),
	stockQuantity: integer("stock_quantity").default(0),
}, (table) => [
	// Performance indexes
	index("product_variants_price_idx").using("btree", table.price.asc().nullsLast().op("numeric_ops")),
	index("product_variants_product_id_idx").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("product_variants_product_size_idx").using("btree", table.productId.asc().nullsLast().op("int4_ops"), table.size.asc().nullsLast().op("text_ops")),
	index("product_variants_size_idx").using("btree", table.size.asc().nullsLast().op("text_ops")),
	index("product_variants_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	uniqueIndex("product_variants_sku_unique_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	// Stock quantity index for inventory queries
	index("product_variants_stock_idx").on(table.stockQuantity),
	// Foreign key with cascade delete
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "product_variants_product_id_products_id_fk"
	}).onDelete("cascade"),
	// Check constraints for data validation
	check("product_variants_price_positive", sql`${table.price} > 0`),
	check("product_variants_stock_non_negative", sql`${table.stockQuantity} >= 0`),
	check("product_variants_size_valid", sql`${table.size} IN ('250ml', '500ml', '1000ml')`),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	customerName: text("customer_name").notNull(),
	customerEmail: text("customer_email").notNull(),
	customerPhone: text("customer_phone").notNull(),
	total: numeric({ precision: 10, scale: 2 }).notNull(),
	status: text().default('pending').notNull(),
	paymentId: text("payment_id"),
	paymentStatus: text("payment_status").default('pending'),
	razorpayOrderId: text("razorpay_order_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	// Performance indexes for common queries
	index("orders_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("orders_customer_email_idx").using("btree", table.customerEmail.asc().nullsLast().op("text_ops")),
	index("orders_payment_id_idx").using("btree", table.paymentId.asc().nullsLast().op("text_ops")),
	uniqueIndex("orders_payment_id_unique_idx").using("btree", table.paymentId.asc().nullsLast().op("text_ops")),
	index("orders_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	// Composite indexes for admin queries
	index("orders_status_created_idx").on(table.status, table.createdAt),
	index("orders_email_created_idx").on(table.customerEmail, table.createdAt),
	// Check constraints for data validation
	check("orders_total_positive", sql`${table.total} > 0`),
	check("orders_status_valid", sql`${table.status} IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`),
	check("orders_payment_status_valid", sql`${table.paymentStatus} IN ('pending', 'success', 'failed', 'refunded')`),
	check("orders_email_format", sql`${table.customerEmail} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`),
]);

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	productId: integer("product_id"),
	productName: text("product_name").notNull(),
	quantity: integer().notNull(),
	pricePerItem: numeric("price_per_item", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
	// Performance indexes
	index("order_items_order_id_idx").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
	index("order_items_order_product_idx").using("btree", table.orderId.asc().nullsLast().op("int4_ops"), table.productId.asc().nullsLast().op("int4_ops")),
	index("order_items_product_id_idx").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	// Foreign keys with cascade delete
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [orders.id],
		name: "order_items_order_id_orders_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [productVariants.id],
		name: "order_items_product_id_product_variants_id_fk"
	}).onDelete("set null"), // Set to null if product variant is deleted
	// Check constraints for data validation
	check("order_items_quantity_positive", sql`${table.quantity} > 0`),
	check("order_items_price_positive", sql`${table.pricePerItem} > 0`),
]);

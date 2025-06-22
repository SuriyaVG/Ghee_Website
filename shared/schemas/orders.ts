import {
  pgTable,
  text,
  serial,
  decimal,
  timestamp,
  integer,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products';
import { productVariants } from './products';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  paymentId: text('payment_id'),
  paymentStatus: text('payment_status').default('pending'),
  razorpayOrderId: text('razorpay_order_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Performance indexes for common queries
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  statusIdx: index('orders_status_idx').on(table.status),
  paymentIdIdx: index('orders_payment_id_idx').on(table.paymentId),
  customerEmailIdx: index('orders_customer_email_idx').on(table.customerEmail),
  // Unique index on payment ID to prevent duplicates
  paymentIdUniqueIdx: uniqueIndex('orders_payment_id_unique_idx').on(table.paymentId),
  // Composite indexes for admin queries
  statusCreatedIdx: index('orders_status_created_idx').on(table.status, table.createdAt),
  emailCreatedIdx: index('orders_email_created_idx').on(table.customerEmail, table.createdAt),
  // Check constraints for data validation
  totalPositive: check('orders_total_positive', sql`${table.total} > 0`),
  statusValid: check('orders_status_valid', sql`${table.status} IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`),
  paymentStatusValid: check('orders_payment_status_valid', sql`${table.paymentStatus} IN ('pending', 'success', 'failed', 'refunded')`),
  emailFormat: check('orders_email_format', sql`${table.customerEmail} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`),
}));

export const insertOrderSchema = z.object({
  customerName: z.string().min(1, 'customerName is required'),
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(1, 'customerPhone is required'),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'total must be a valid decimal string'),
  status: z.string().min(1, 'status is required'),
  paymentStatus: z.string().min(1, 'paymentStatus is required'),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  product_id: integer('product_id').references(() => productVariants.id, { onDelete: 'set null' }),
  product_name: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  price_per_item: decimal('price_per_item', { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  // Performance indexes
  orderIdIdx: index('order_items_order_id_idx').on(table.order_id),
  productIdIdx: index('order_items_product_id_idx').on(table.product_id),
  // Composite index for order_id + product_id queries
  orderProductIdx: index('order_items_order_product_idx').on(table.order_id, table.product_id),
  // Check constraints for data validation
  quantityPositive: check('order_items_quantity_positive', sql`${table.quantity} > 0`),
  pricePositive: check('order_items_price_positive', sql`${table.price_per_item} > 0`),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect; 
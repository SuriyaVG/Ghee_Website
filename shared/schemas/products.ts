import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., "Pure Ghee", "A2 Cow Ghee"
  description: text('description').notNull(), // General description for the product line
  is_popular: boolean('is_popular').default(false), // Is this product line generally popular?
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  size: text('size').notNull(), // e.g., "250ml", "500g", "1L"
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url').notNull(), // URL for the variant-specific image
  best_value_badge: text('best_value_badge'), // Optional: e.g., "Best Value", "Family Pack"
  sku: text('sku'), // Optional: Stock Keeping Unit
  stock_quantity: integer('stock_quantity').default(0), // Optional: for inventory management
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
}; 
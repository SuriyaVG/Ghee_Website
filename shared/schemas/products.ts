import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., "Pure Ghee", "A2 Cow Ghee"
  description: text('description').notNull(), // General description for the product line
  is_popular: boolean('is_popular').default(false), // Is this product line generally popular?
}, (table) => ({
  // Performance indexes
  nameIdx: index('products_name_idx').on(table.name),
  popularIdx: index('products_popular_idx').on(table.is_popular),
  // Unique index on name to prevent duplicate products
  nameUniqueIdx: uniqueIndex('products_name_unique_idx').on(table.name),
  // Composite index for popular products
  popularNameIdx: index('products_popular_name_idx').on(table.is_popular, table.name),
}));

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
}, (table) => ({
  // Performance indexes
  productIdIdx: index('product_variants_product_id_idx').on(table.product_id),
  sizeIdx: index('product_variants_size_idx').on(table.size),
  priceIdx: index('product_variants_price_idx').on(table.price),
  skuIdx: index('product_variants_sku_idx').on(table.sku),
  // Stock quantity index for inventory queries
  stockIdx: index('product_variants_stock_idx').on(table.stock_quantity),
  // Composite index for product_id + size queries
  productSizeIdx: index('product_variants_product_size_idx').on(table.product_id, table.size),
  // Unique index on SKU to prevent duplicates
  skuUniqueIdx: uniqueIndex('product_variants_sku_unique_idx').on(table.sku),
  // Check constraints for data validation
  pricePositive: check('product_variants_price_positive', sql`${table.price} > 0`),
  stockNonNegative: check('product_variants_stock_non_negative', sql`${table.stock_quantity} >= 0`),
  sizeValid: check('product_variants_size_valid', sql`${table.size} IN ('250ml', '500ml', '1000ml')`),
}));

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
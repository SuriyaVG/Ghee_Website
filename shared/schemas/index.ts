export * from './orders';
export * from './contacts';
export * from './products';
export * from './users';

import { relations } from 'drizzle-orm';
import { products, productVariants } from './products';
import { orders, orderItems } from './orders';

export const productRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.product_id],
    references: [products.id],
  }),
}));

export const orderRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.product_id],
    references: [productVariants.id],
  }),
})); 
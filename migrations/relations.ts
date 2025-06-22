import { relations } from "drizzle-orm/relations";
import { products, productVariants, orders, orderItems } from "./schema";

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
	orderItems: many(orderItems),
}));

export const productsRelations = relations(products, ({many}) => ({
	productVariants: many(productVariants),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	productVariant: one(productVariants, {
		fields: [orderItems.productId],
		references: [productVariants.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	orderItems: many(orderItems),
}));
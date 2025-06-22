import {
  products,
  orders,
  contacts,
  productVariants,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type ProductWithVariants,
  type Order,
  type InsertOrder,
  type Contact,
  type InsertContact,
} from '@shared/schema';

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { orderItems, InsertOrderItem, OrderItem } from '@shared/schemas/orders';
import { eq, inArray, relations } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { users } from '@shared/schemas';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: {...schema, ...relations} });

export interface IStorage {
  // Products
  getAllProducts(): Promise<ProductWithVariants[]>;
  getProduct(id: number): Promise<ProductWithVariants | undefined>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByPaymentId(paymentId: string): Promise<Order | undefined>;
  updateOrderStatus(orderId: number, status: string, paymentStatus: string, cfPaymentId?: string | null): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;

  // Users
  getUserByEmail(email: string): Promise<{ id: number; email: string; passwordHash: string } | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private productVariants: Map<number, ProductVariant>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, any[]>;
  private contacts: Map<number, Contact>;
  private currentProductId: number;
  private currentVariantId: number;
  private currentOrderId: number;
  private currentContactId: number;

  constructor() {
    this.products = new Map();
    this.productVariants = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.contacts = new Map();
    this.currentProductId = 1;
    this.currentVariantId = 1;
    this.currentOrderId = 1;
    this.currentContactId = 1;

    this.initializeProductsAndVariants();
  }

  private initializeProductsAndVariants() {
    const mainProduct: Product = {
      id: this.currentProductId++,
      name: 'Pure Ghee',
      description:
        'Crafted with 50 years of tradition, our Pure Ghee is made from the finest quality milk, churned to perfection to bring you an authentic taste and aroma. Ideal for cooking, medicinal purposes, and religious ceremonies.',
      is_popular: true,
    };
    this.products.set(mainProduct.id, mainProduct);

    const variantsData: Array<Omit<InsertProductVariant, 'product_id' | 'id'>> = [
      {
        size: '250ml',
        price: '170.00',
        image_url: '/images/ghee-250ml.jpg',
        best_value_badge: null,
        sku: 'GSR-GHEE-250',
        stock_quantity: 100,
      },
      {
        size: '500ml',
        price: '325.00',
        image_url: '/images/ghee-500ml.jpg',
        best_value_badge: 'Best Value',
        sku: 'GSR-GHEE-500',
        stock_quantity: 100,
      },
      {
        size: '1000ml',
        price: '650.00',
        image_url: '/images/ghee-1000ml.jpg',
        best_value_badge: 'Family Pack',
        sku: 'GSR-GHEE-1000',
        stock_quantity: 50,
      },
    ];

    variantsData.forEach((variantData) => {
      const variant: ProductVariant = {
        id: this.currentVariantId++,
        product_id: mainProduct.id,
        ...variantData,
        best_value_badge:
          variantData.best_value_badge === undefined ? null : variantData.best_value_badge,
        sku: variantData.sku === undefined ? null : variantData.sku,
        stock_quantity: variantData.stock_quantity === undefined ? 0 : variantData.stock_quantity,
      };
      this.productVariants.set(variant.id, variant);
    });
  }

  async getAllProducts(): Promise<ProductWithVariants[]> {
    const productsWithVariants: ProductWithVariants[] = [];
    for (const product of Array.from(this.products.values())) {
      const variants = Array.from(this.productVariants.values()).filter(
        (variant) => variant.product_id === product.id
      );
      productsWithVariants.push({ ...product, variants });
    }
    return productsWithVariants;
  }

  async getProduct(id: number): Promise<ProductWithVariants | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const variants = Array.from(this.productVariants.values()).filter(
      (variant) => variant.product_id === product.id
    );
    return { ...product, variants };
  }

  async createOrder(insertOrder: InsertOrder & { items?: any[] }): Promise<Order & { items?: any[] }> {
    const id = this.currentOrderId++;
    const { items, ...orderData } = insertOrder;
    const order: Order = {
      id,
      createdAt: new Date(),
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      total: orderData.total,
      status: orderData.status || 'pending',
      paymentId: 'paymentId' in orderData ? orderData.paymentId : null,
      paymentStatus: orderData.paymentStatus || 'pending',
      razorpayOrderId: 'razorpayOrderId' in orderData ? orderData.razorpayOrderId : null,
    };
    this.orders.set(id, order);
    if (items) {
      const transformedItems = items.map(item => ({
        product_name: item.name,
        quantity: item.quantity,
        price_per_item: item.price,
        product_id: item.productId || null,
      }));
      this.orderItems.set(id, transformedItems);
      return { ...order, items: transformedItems };
    }
    return { ...order, items: [] };
  }

  async getOrder(id: number): Promise<(Order & { items?: any[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const items = this.orderItems.get(id) || [];
    return { ...order, items };
  }

  async getOrderByPaymentId(paymentId: string): Promise<(Order & { items?: any[] }) | undefined> {
    const order = Array.from(this.orders.values()).find(order => order.paymentId === paymentId);
    if (!order) return undefined;
    const items = this.orderItems.get(order.id) || [];
    return { ...order, items };
  }

  async updateOrderStatus(orderId: number, status: string, paymentStatus: string, cfPaymentId?: string | null): Promise<(Order & { items?: any[] }) | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      order.paymentStatus = paymentStatus;
      if(cfPaymentId) {
        order.razorpayOrderId = cfPaymentId;
      }
      this.orders.set(orderId, order);
      const items = this.orderItems.get(orderId) || [];
      return { ...order, items: items.map(item => ({
        ...item,
        price_per_item: typeof item.price_per_item === 'string' ? item.price_per_item : String(item.price_per_item ?? ''),
        product_id: typeof item.product_id === 'number' ? item.product_id : (item.product_id ? Number(item.product_id) : null)
      })) };
    }
    return undefined;
  }

  async getAllOrders(): Promise<(Order & { items?: any[] })[]> {
    return Array.from(this.orders.values()).map(order => ({
      ...order,
      items: (this.orderItems.get(order.id) || []).map(item => ({
        ...item,
        price_per_item: typeof item.price_per_item === 'string' ? item.price_per_item : String(item.price_per_item ?? ''),
        product_id: typeof item.product_id === 'number' ? item.product_id : (item.product_id ? Number(item.product_id) : null)
      })),
    }));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = {
      id,
      createdAt: new Date(),
      phone: insertContact.phone === undefined ? null : insertContact.phone,
      ...insertContact,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getUserByEmail(email: string): Promise<{ id: number; email: string; passwordHash: string } | undefined> {
    // Not implemented for in-memory
    return undefined;
  }
}

export class PgStorage implements IStorage {
  // Products
  async getAllProducts(): Promise<ProductWithVariants[]> {
    const allProducts = await db.select().from(products);
    const allVariants = await db.select().from(productVariants);
    
    return allProducts.map(product => ({
      ...product,
      variants: allVariants.filter(variant => variant.product_id === product.id)
    }));
  }

  async getProduct(id: number): Promise<ProductWithVariants | undefined> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        variants: true,
      },
    });
    return product ? { ...product, variants: product.variants.map(v => ({...v, price: v.price ?? ''})) } : undefined;
  }

  // Orders
  async createOrder(order: InsertOrder & { items: any[] }): Promise<Order & { items?: any[] }> {
    const { items, ...orderData } = order;

    const newOrder = await db
      .insert(orders)
      .values(orderData)
      .returning();

    const orderItemsData = await Promise.all(items.map(async (item) => {
      // Defensively remove any size suffix from the incoming name
      const baseName = item.name.replace(/\s+\d+ml$/i, '').trim();
      
      const variant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, item.productId),
      });

      // Use the fetched variant's size to construct the definitive product name
      const productName = variant ? `${baseName} ${variant.size}` : baseName;
      
      return {
        order_id: newOrder[0].id,
        product_id: item.productId,
        product_name: productName,
        quantity: item.quantity,
        price_per_item: item.price.toString(),
      };
    }));

    const newOrderItems = await db
      .insert(orderItems)
      .values(orderItemsData)
      .returning();

    return { ...newOrder[0], items: newOrderItems.map(item => ({...item, price_per_item: item.price_per_item ?? ''})) };
  }

  async getOrder(id: number): Promise<(Order & { items?: any[] }) | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: true,
      },
    });
    if (order) {
      return { ...order, items: order.items.map(item => ({...item, price_per_item: item.price_per_item ?? ''})) };
    }
    return undefined;
  }

  async getOrderByPaymentId(paymentId: string): Promise<(Order & { items?: any[] }) | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.paymentId, paymentId),
      with: {
        items: true,
      },
    });
    if (order) {
      return { ...order, items: order.items.map(item => ({...item, price_per_item: item.price_per_item ?? ''})) };
    }
    return undefined;
  }

  async updateOrderStatus(orderId: number, status: string, paymentStatus: string, cfPaymentId?: string | null): Promise<(Order & { items?: any[] }) | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, paymentStatus, razorpayOrderId: cfPaymentId })
      .where(eq(orders.id, orderId))
      .returning();
    if (updatedOrder) {
      const orderItemsResult = await db.query.orderItems.findMany({ where: eq(orderItems.order_id, orderId) });
      return { ...updatedOrder, items: orderItemsResult.map(item => ({
        ...item,
        price_per_item: typeof item.price_per_item === 'string' ? item.price_per_item : String(item.price_per_item ?? ''),
        product_id: typeof item.product_id === 'number' ? item.product_id : (item.product_id ? Number(item.product_id) : null)
      })) };
    }
    return undefined;
  }

  async getAllOrders(): Promise<(Order & { items?: any[] })[]> {
    const allOrders = await db.query.orders.findMany({
      with: {
        items: true,
      },
    });

    return allOrders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        price_per_item: typeof item.price_per_item === 'string' ? item.price_per_item : String(item.price_per_item ?? ''),
        product_id: typeof item.product_id === 'number' ? item.product_id : (item.product_id ? Number(item.product_id) : null)
      })),
    }));
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  // Users
  async getUserByEmail(email: string): Promise<{ id: number; email: string; passwordHash: string } | undefined> {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return undefined;
    return { id: user.id, email: user.email, passwordHash: user.passwordHash };
  }
}

// export const storage = new MemStorage();
export const storage = new PgStorage(); // Production: PostgreSQL storage

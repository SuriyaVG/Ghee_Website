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
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private productVariants: Map<number, ProductVariant>;
  private orders: Map<number, Order>;
  private contacts: Map<number, Contact>;
  private currentProductId: number;
  private currentVariantId: number;
  private currentOrderId: number;
  private currentContactId: number;

  constructor() {
    this.products = new Map();
    this.productVariants = new Map();
    this.orders = new Map();
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

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      id,
      createdAt: new Date(),
      status: insertOrder.status || 'pending',
      paymentId: insertOrder.paymentId === undefined ? null : insertOrder.paymentId,
      paymentStatus:
        insertOrder.paymentStatus === undefined
          ? 'pending'
          : insertOrder.paymentStatus || 'pending',
      razorpayOrderId:
        insertOrder.razorpayOrderId === undefined ? null : insertOrder.razorpayOrderId,
      ...insertOrder,
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByPaymentId(paymentId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.paymentId === paymentId);
  }

  async updateOrderStatus(orderId: number, status: string, paymentStatus: string, cfPaymentId?: string | null): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      order.paymentStatus = paymentStatus;
      if(cfPaymentId) {
        order.razorpayOrderId = cfPaymentId; // Re-using this field for the CF payment ID
      }
      this.orders.set(orderId, order);
    }
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
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
}

export const storage = new MemStorage();

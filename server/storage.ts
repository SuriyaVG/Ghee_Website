import { products, orders, contacts, type Product, type InsertProduct, type Order, type InsertOrder, type Contact, type InsertContact } from "@shared/schema";

export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private contacts: Map<number, Contact>;
  private currentProductId: number;
  private currentOrderId: number;
  private currentContactId: number;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.contacts = new Map();
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentContactId = 1;
    
    // Initialize with GSR ghee products
    this.initializeProducts();
  }

  private initializeProducts() {
    const initialProducts: Product[] = [
      {
        id: 1,
        name: "Pure Ghee 250ml",
        description: "Perfect for small families and daily cooking needs. Pure, aromatic, and rich in flavor.",
        size: "250ml",
        price: "170.00",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        popular: "Popular",
        bestValue: null,
      },
      {
        id: 2,
        name: "Pure Ghee 500ml",
        description: "Ideal for medium families. Great value with the perfect balance of quality and quantity.",
        size: "500ml",
        price: "325.00",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        popular: null,
        bestValue: "Best Value",
      },
      {
        id: 3,
        name: "Pure Ghee 1000ml",
        description: "Perfect for large families and bulk cooking. Maximum freshness and authentic taste.",
        size: "1000ml",
        price: "650.00",
        image: "https://pixabay.com/get/gbc03206a5bc65659ba44400d7bc4b824a1d3c90ac25f954ff69213ece9eda739ec338f9ce5e9f33dd9d7255ee3cda04b969607b2048d8ded5caa5d81953b2188_1280.jpg",
        popular: null,
        bestValue: null,
      },
    ];

    initialProducts.forEach(product => {
      this.products.set(product.id, product);
      this.currentProductId = Math.max(this.currentProductId, product.id + 1);
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }
}

export const storage = new MemStorage();

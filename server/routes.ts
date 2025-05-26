import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cashfree configuration
  const cashfreeConfig = {
    appId: process.env.CASHFREE_APP_ID || 'demo_app_id',
    secretKey: process.env.CASHFREE_SECRET_KEY || 'demo_secret',
    baseUrl: process.env.CASHFREE_ENV === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com'
  };
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Create Cashfree order
  app.post("/api/create-cashfree-order", async (req, res) => {
    try {
      const { amount, currency = "INR", customerInfo } = req.body;
      
      const orderData = {
        order_id: `order_${Date.now()}`,
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: `customer_${Date.now()}`,
          customer_name: customerInfo.customerName,
          customer_email: customerInfo.customerEmail,
          customer_phone: customerInfo.customerPhone
        },
        order_meta: {
          return_url: `${req.protocol}://${req.get('host')}/payment-success`,
          notify_url: `${req.protocol}://${req.get('host')}/api/cashfree-webhook`
        }
      };

      const response = await axios.post(
        `${cashfreeConfig.baseUrl}/pg/orders`,
        orderData,
        {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': cashfreeConfig.appId,
            'x-client-secret': cashfreeConfig.secretKey,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({ 
        orderId: response.data.order_id,
        paymentSessionId: response.data.payment_session_id,
        amount: response.data.order_amount,
        currency: response.data.order_currency 
      });
    } catch (error) {
      console.error("Cashfree order creation failed:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Verify Cashfree payment
  app.post("/api/verify-cashfree-payment", async (req, res) => {
    try {
      const { orderId } = req.body;
      
      const response = await axios.get(
        `${cashfreeConfig.baseUrl}/pg/orders/${orderId}`,
        {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': cashfreeConfig.appId,
            'x-client-secret': cashfreeConfig.secretKey
          }
        }
      );

      res.json({ 
        success: response.data.order_status === 'PAID',
        paymentId: response.data.cf_order_id,
        orderId: response.data.order_id,
        status: response.data.order_status
      });
    } catch (error) {
      console.error("Cashfree payment verification failed:", error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  });

  // Create contact
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid contact data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

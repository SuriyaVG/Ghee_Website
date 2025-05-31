import type { Express, Request, Response, NextFunction } from 'express';
import { type AnyZodObject } from 'zod';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { insertOrderSchema, insertContactSchema } from '@shared/schema';
import axios from 'axios';
// Domain-specific routers
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import contactsRouter from './routes/contacts';
import cashfreeRouter from './routes/cashfree';
// Validation middleware
import { validateRequest } from './middleware/validateRequest';

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount domain routers
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/contacts', contactsRouter);

  // Mount Cashfree routes if environment variables are set
  const hasCashfreeEnv =
    !!process.env.CASHFREE_APP_ID &&
    !!process.env.CASHFREE_SECRET_KEY &&
    !!process.env.CASHFREE_ENV;
  if (hasCashfreeEnv) {
    app.use('/api', cashfreeRouter);
  } else {
    console.warn('Cashfree environment variables not set. Payment endpoints disabled.');
  }

  const httpServer = createServer(app);
  return httpServer;
}

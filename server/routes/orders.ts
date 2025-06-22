import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { validateRequest } from '../middleware/validateRequest';
import { insertOrderSchema } from '@shared/schemas/orders';
import type { Order } from '@shared/schemas/orders';
import { z } from 'zod';
// @ts-ignore: No type definitions for json2csv
import { Parser as CsvParser } from 'json2csv';
import { requireAuth } from '../middleware/checkAuth';

const router = Router();

const orderWithItemsSchema = insertOrderSchema.extend({
  items: z.array(z.object({
    productId: z.number().optional(),
    name: z.string(),
    quantity: z.number(),
    price: z.string().or(z.number()),
  })).min(1, 'At least one item is required'),
});

// Create a new order
router.post('/', validateRequest(orderWithItemsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accepts items as array or JSON string for backward compatibility
    let items = req.body.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch { items = []; }
    }
    const { items: _omit, ...orderData } = req.body; // Remove items from orderData
    const order = await storage.createOrder({ ...orderData, items });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Get a single order by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    if (!order) {
      const err: any = new Error('Order not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders (admin, paginated)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 50));
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
    const allOrders = await storage.getAllOrders() as (Order & { items?: any[] })[];
    const paginated = allOrders.slice(offset, offset + limit).map(order => ({
      id: order.id,
      customerName: order.customerName,
      phoneNumber: order.customerPhone,
      items: order.items ?? [],
      totalAmount: order.total,
      paymentMethod: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
    }));
    res.json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/orders/:id/status (admin only)
const statusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']) });

router.patch('/:id/status', requireAuth, validateRequest(statusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const order = await storage.getOrder(id);
    if (!order) {
      const err: any = new Error('Order not found');
      err.statusCode = 404;
      return next(err);
    }
    const updated = await storage.updateOrderStatus(id, status, order.paymentStatus || 'pending');
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/export/csv (admin only)
router.get('/export/csv', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;
    let ordersList = await storage.getAllOrders();
    // Filter by status
    if (status) {
      ordersList = ordersList.filter(o => o.status === status);
    }
    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate as string) : new Date();
      ordersList = ordersList.filter(o => {
        const created = new Date(o.createdAt || 0);
        return created >= start && created <= end;
      });
    }
    // Flatten orders for CSV (one row per item)
    const rows = ordersList.flatMap(order =>
      (order.items || []).map(item => ({
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        itemName: item.product_name,
        itemQuantity: item.quantity,
        itemPrice: item.price_per_item,
      }))
    );
    const csvParser = new CsvParser({ fields: [
      'orderId', 'customerName', 'customerEmail', 'customerPhone', 'total', 'status', 'paymentStatus', 'createdAt', 'itemName', 'itemQuantity', 'itemPrice'
    ] });
    const csv = csvParser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders_export.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export orders as CSV' });
  }
});

export default router; 
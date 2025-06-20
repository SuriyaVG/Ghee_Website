import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { validateRequest } from '../middleware/validateRequest';
import { insertOrderSchema } from '@shared/schemas/orders';

const router = Router();

// Create a new order
router.post('/', validateRequest(insertOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await storage.createOrder(req.body);
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

// Admin authentication middleware
function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Header:', authHeader, 'Token:', token, 'Expected:', process.env.ADMIN_API_TOKEN);
  if (!token || token !== process.env.ADMIN_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// GET /api/orders (admin, paginated)
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 50));
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
    const allOrders = await storage.getAllOrders();
    const paginated = allOrders.slice(offset, offset + limit).map(order => ({
      id: order.id,
      customerName: order.customerName,
      phoneNumber: order.customerPhone,
      items: (() => { try { return JSON.parse(order.items); } catch { return order.items; } })(),
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

export default router; 
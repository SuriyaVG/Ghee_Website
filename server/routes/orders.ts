import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { validateRequest } from '../middleware/validateRequest';
import { insertOrderSchema } from '@shared/schema';

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

export default router; 
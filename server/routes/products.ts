import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get single product by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

export default router; 
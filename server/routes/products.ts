import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../middleware/checkAuth';
import { z } from 'zod';

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

// PATCH /:productId/variant/:variantId/stock
const stockSchema = z.object({ stock_quantity: z.number().int().min(0) });

router.patch('/:productId/variant/:variantId/stock', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId } = req.params;
    const { stock_quantity } = stockSchema.parse(req.body);
    // Update the variant's stock
    const product = await storage.getProduct(Number(productId));
    if (!product) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    const variant = product.variants.find(v => v.id === Number(variantId));
    if (!variant) {
      const err: any = new Error('Variant not found');
      err.statusCode = 404;
      return next(err);
    }
    // Update in DB
    await storage.updateVariantStock(Number(variantId), stock_quantity);
    // Return updated variant
    const updatedProduct = await storage.getProduct(Number(productId));
    const updatedVariant = updatedProduct?.variants.find(v => v.id === Number(variantId));
    res.json(updatedVariant);
  } catch (error) {
    next(error);
  }
});

export default router; 
import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { validateRequest } from '../middleware/validateRequest';
import { insertContactSchema } from '@shared/schema';

const router = Router();

// Create a new contact message
router.post('/', validateRequest(insertContactSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await storage.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

export default router; 
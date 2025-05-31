import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validateRequest = (schema: AnyZodObject, property: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req[property] = await schema.parseAsync(req[property]);
      next();
    } catch (error) {
      next(error);
    }
  }; 
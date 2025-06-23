import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({ err, url: req.originalUrl, method: req.method, body: req.body }, err.message || 'Unhandled error');
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
} 
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) return res.status(400).json({ message: 'Validación fallida', errors: err.errors });
  if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: 'Error interno' });
}
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = (req as any).cookies?.accessToken;
  if (!token) return next(new AppError(401, 'No autenticado'));
  try {
    (req as any).user = verifyAccessToken(token);
    next();
  } catch { next(new AppError(401, 'Token inválido')); }
}
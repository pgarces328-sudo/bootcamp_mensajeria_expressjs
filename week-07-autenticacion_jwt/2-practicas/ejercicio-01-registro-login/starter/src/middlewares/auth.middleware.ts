import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
export function authMiddleware(req: Request, _res: Response, next: NextFunction) { const token = (req as any).cookies?.accessToken; if (!token) return next(new AppError(401, 'No autenticado')); try { const payload = verifyAccessToken(token); (req as any).user = payload; next(); } catch { next(new AppError(401, 'Token inválido')); } }
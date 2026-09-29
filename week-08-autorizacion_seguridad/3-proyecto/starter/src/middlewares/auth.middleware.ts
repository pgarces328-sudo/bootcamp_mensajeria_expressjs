import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/AppError';
import type { UserRole } from '../models/user.model';
import { verifyAccessToken } from '../utils/jwt';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const accessToken = req.cookies?.accessToken as
    | string
    | undefined;

  if (!accessToken) {
    next(new AppError(401, 'No autenticado'));
    return;
  }

  try {
    const payload = verifyAccessToken(accessToken);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role as UserRole, // <--- AQUÍ ESTÁ LA SOLUCIÓN
    };

    next();
  } catch {
    next(new AppError(401, 'Token invalido o expirado'));
  }
}
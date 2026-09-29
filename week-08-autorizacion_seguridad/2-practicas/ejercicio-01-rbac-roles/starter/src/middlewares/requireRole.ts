import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/AppError';
import type { UserRole } from '../models/user.model';

export function requireRole(
  ...allowedRoles: UserRole[]
) {
  return function roleMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!req.user) {
      next(new AppError(401, 'No autenticado'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          403,
          'No tienes permisos para esta accion'
        )
      );
      return;
    }

    next();
  };
}
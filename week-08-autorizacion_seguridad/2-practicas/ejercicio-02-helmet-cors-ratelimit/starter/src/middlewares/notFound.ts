import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/AppError';

export function notFound(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(
    new AppError(
      404,
      `La ruta ${req.method} ${req.originalUrl} no existe`
    )
  );
}
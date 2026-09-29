import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Datos de entrada invalidos',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Error de validacion',
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
}
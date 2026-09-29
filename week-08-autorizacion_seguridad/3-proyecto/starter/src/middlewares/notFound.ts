import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
export const notFound = (req: Request, res: Response, next: any) => next(new AppError('Ruta no encontrada', 404));

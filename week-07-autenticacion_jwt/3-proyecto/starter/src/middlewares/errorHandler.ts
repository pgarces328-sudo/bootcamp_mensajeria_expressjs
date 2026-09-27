import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const code = err instanceof AppError ? err.statusCode : 500;
    res.status(code).json({ success: false, message: err.message });
};

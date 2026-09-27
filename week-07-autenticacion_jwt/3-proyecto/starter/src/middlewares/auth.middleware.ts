import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';
export const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies.accessToken;
    if(!token) return next(new AppError('No autenticado', 401)); // Mensaje string primero
    try {
        const dec = verifyAccessToken(token);
        req.user = dec;
        next();
    } catch(e) {
        next(new AppError('Token invalido', 401)); // Mensaje string primero
    }
};

import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/AppError';
import {
  loginSchema,
  registerSchema,
} from '../schemas/auth.schema';
import * as authService from '../services/auth.service';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const user = await authService.register(input);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'No autenticado');
    }

    const user = await authService.getMe(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  _req: Request,
  res: Response
): Promise<void> {
  res.clearCookie('accessToken', cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Sesion cerrada',
  });
}
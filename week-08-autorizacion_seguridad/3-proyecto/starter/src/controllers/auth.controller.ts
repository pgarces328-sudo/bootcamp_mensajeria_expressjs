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

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
}

// 🛡️ FUNCIÓN ESPECIAL: Extrae el token sin importar cómo lo envíe Thunder Client
function getRefreshTokenFromReq(req: Request): string | undefined {
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/refreshToken=([^;]+)/);
    if (match) return match[1];
  }
  return undefined;
}

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

    setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

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

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = getRefreshTokenFromReq(req);

    if (!refreshToken) {
      throw new AppError(401, 'Refresh token no encontrado');
    }

    const tokens = await authService.refreshSession(refreshToken);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Sesion renovada correctamente',
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = getRefreshTokenFromReq(req);

    if (refreshToken) {
      // ESTO MATA EL TOKEN EN LA BASE DE DATOS
      await authService.logout(refreshToken);
    }

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
}
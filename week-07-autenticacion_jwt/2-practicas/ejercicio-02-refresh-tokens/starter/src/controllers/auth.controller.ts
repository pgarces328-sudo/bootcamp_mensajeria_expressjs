import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import * as service from '../services/auth.service';
function setCookies(res: Response, a: string, r: string) {
  res.cookie('accessToken', a, { httpOnly: true, sameSite: 'lax', maxAge: 15*60*1000 });
  res.cookie('refreshToken', r, { httpOnly: true, sameSite: 'lax', maxAge: 7*24*60*60*1000 });
}
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await service.registerService(dto);
    setCookies(res, accessToken, refreshToken);
    res.status(201).json(user);
  } catch (e) { next(e); }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await service.loginService(dto);
    setCookies(res, accessToken, refreshToken);
    res.status(200).json(user);
  } catch (e) { next(e); }
}
export async function me(req: Request, res: Response) { res.json((req as any).user); }
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rt = (req as any).cookies?.refreshToken;
    const { user, accessToken, refreshToken } = await service.refreshService(rt);
    setCookies(res, accessToken, refreshToken);
    res.status(200).json(user);
  } catch (e) { next(e); }
}
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req as any).user?.id;
    if (id) await service.logoutService(id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Sesión cerrada' });
  } catch (e) { next(e); }
}
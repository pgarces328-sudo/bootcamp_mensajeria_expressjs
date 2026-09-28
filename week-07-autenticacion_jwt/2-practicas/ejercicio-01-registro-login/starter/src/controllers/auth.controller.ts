import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import * as service from '../services/auth.service.js';
export async function register(req: Request, res: Response, next: NextFunction) { try { const dto = registerSchema.parse(req.body); const { user, token } = await service.registerService(dto); res.cookie('accessToken', token, { httpOnly: true, sameSite: 'lax', maxAge: 15*60*1000 }); res.status(201).json(user); } catch (e) { next(e); } }
export async function login(req: Request, res: Response, next: NextFunction) { try { const dto = loginSchema.parse(req.body); const { user, token } = await service.loginService(dto); res.cookie('accessToken', token, { httpOnly: true, sameSite: 'lax', maxAge: 15*60*1000 }); res.status(200).json(user); } catch (e) { next(e); } }
export async function me(req: Request, res: Response) { res.json((req as any).user); }
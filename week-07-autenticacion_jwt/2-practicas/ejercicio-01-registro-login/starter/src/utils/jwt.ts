import jwt from 'jsonwebtoken';
export interface AccessPayload { id: string; email: string; role: string; }
export function signAccessToken(payload: AccessPayload): string { const secret = process.env.JWT_ACCESS_SECRET; if (!secret) throw new Error('Falta JWT_ACCESS_SECRET'); return jwt.sign(payload, secret, { expiresIn: '15m' }); }
export function verifyAccessToken(token: string): AccessPayload { const secret = process.env.JWT_ACCESS_SECRET!; return jwt.verify(token, secret) as AccessPayload; }
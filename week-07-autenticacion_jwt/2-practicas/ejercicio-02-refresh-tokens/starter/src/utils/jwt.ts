import jwt from 'jsonwebtoken';
export interface AccessPayload { id: string; email: string; role: string; }
export function signAccessToken(payload: AccessPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('Falta JWT_ACCESS_SECRET');
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}
export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AccessPayload;
}
export function signRefreshToken(payload: { id: string }): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('Falta JWT_REFRESH_SECRET');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}
export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
}
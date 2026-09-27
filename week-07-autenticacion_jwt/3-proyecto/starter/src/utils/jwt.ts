import jwt from 'jsonwebtoken';
const ACC_SEC = process.env.JWT_ACCESS_SECRET || 'secret_access';
const REF_SEC = process.env.JWT_REFRESH_SECRET || 'secret_refresh';
export const signAccessToken = (id: string, role: string) => jwt.sign({ id, role }, ACC_SEC, { expiresIn: '15m' });
export const verifyAccessToken = (token: string) => jwt.verify(token, ACC_SEC) as any;
export const signRefreshToken = (id: string) => jwt.sign({ id }, REF_SEC, { expiresIn: '7d' });

import 'dotenv/config';

import jwt, {
  type JwtPayload as BaseJwtPayload,
} from 'jsonwebtoken';

import type { UserRole } from '../models/user.model';

export interface JwtPayload extends BaseJwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error('Falta JWT_ACCESS_SECRET en el archivo .env');
  }

  return secret;
}

export function signAccessToken(
  id: string,
  email: string,
  role: UserRole
): string {
  return jwt.sign(
    {
      id,
      email,
      role,
    },
    getAccessSecret(),
    {
      expiresIn: '15m',
    }
  );
}

export function verifyAccessToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,
    getAccessSecret()
  ) as JwtPayload;
}
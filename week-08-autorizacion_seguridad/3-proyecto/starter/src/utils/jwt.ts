import 'dotenv/config';

import jwt, {
  type JwtPayload,
} from 'jsonwebtoken';

export interface AccessTokenPayload
  extends JwtPayload {
  id: string;
  role: string;
}

export interface RefreshTokenPayload
  extends JwtPayload {
  id: string;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(
      'Falta JWT_ACCESS_SECRET en el archivo .env'
    );
  }

  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error(
      'Falta JWT_REFRESH_SECRET en el archivo .env'
    );
  }

  return secret;
}

export function signAccessToken(
  id: string,
  role: string
): string {
  return jwt.sign(
    {
      id,
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
): AccessTokenPayload {
  return jwt.verify(
    token,
    getAccessSecret()
  ) as AccessTokenPayload;
}

export function signRefreshToken(
  id: string
): string {
  return jwt.sign(
    {
      id,
    },
    getRefreshSecret(),
    {
      expiresIn: '7d',
    }
  );
}

export function verifyRefreshToken(
  token: string
): RefreshTokenPayload {
  return jwt.verify(
    token,
    getRefreshSecret()
  ) as RefreshTokenPayload;
}
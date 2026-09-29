import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

function getWhitelist(): string[] {
  const rawWhitelist = process.env.CORS_WHITELIST ?? '';

  return rawWhitelist
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = getWhitelist();

    if (!origin) {
      callback(null, true);
      return;
    }

    if (whitelist.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
};

export const corsMiddleware = cors(corsOptions);

export const helmetMiddleware = helmet();

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: true,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta mas tarde.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: true,
  message: {
    success: false,
    message:
      'Demasiados intentos de autenticacion. Espera 15 minutos.',
  },
});
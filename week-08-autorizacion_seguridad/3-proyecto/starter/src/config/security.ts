import cors, {
  type CorsOptions,
} from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { AppError } from '../errors/AppError';

function getWhitelist(): string[] {
  return (process.env.CORS_WHITELIST ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
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

    callback(
      new AppError(
        403,
        'Origen no permitido por CORS'
      )
    );
  },

  credentials: true,
  methods: [
    'GET',
    'POST',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],
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
    message:
      'Demasiadas solicitudes. Intenta mas tarde.',
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
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize'; // Protección contra NoSQL Injection

import {
  authLimiter,
  corsMiddleware,
  globalLimiter,
  helmetMiddleware,
} from './config/security';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import authRouter from './routes/auth.routes';
import packageRouter from './routes/package.routes';

const app = express();

// 1. SEGURIDAD
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(globalLimiter);
app.use(mongoSanitize()); // Previene NoSQL Injection

app.use(express.json({ limit: '10kb' })); // Límite de tamaño de body
app.use(cookieParser());

// 2. RUTAS
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/packages', packageRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
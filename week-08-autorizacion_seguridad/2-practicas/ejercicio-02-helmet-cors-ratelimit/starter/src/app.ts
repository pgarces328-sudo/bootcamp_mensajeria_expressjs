import cookieParser from 'cookie-parser';
import express from 'express';

import {
  authLimiter,
  corsMiddleware,
  globalLimiter,
  helmetMiddleware,
} from './config/security';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import authRouter from './routes/auth.routes';
import publicRouter from './routes/public.routes';

const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1', publicRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
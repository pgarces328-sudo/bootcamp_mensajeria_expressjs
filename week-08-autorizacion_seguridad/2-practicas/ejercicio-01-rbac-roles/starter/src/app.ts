import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import adminRouter from './routes/admin.routes';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
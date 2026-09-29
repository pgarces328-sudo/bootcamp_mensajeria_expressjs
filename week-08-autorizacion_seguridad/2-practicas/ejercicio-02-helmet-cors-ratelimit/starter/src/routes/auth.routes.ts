import { Router } from 'express';

import {
  login,
  logout,
  me,
  register,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authMiddleware, me);
authRouter.post('/logout', logout);

export default authRouter;
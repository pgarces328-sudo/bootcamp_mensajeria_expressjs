import { Router } from 'express';

import {
  getDashboard,
  getPublicInfo,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole';

const userRouter = Router();

userRouter.get('/public', getPublicInfo);

userRouter.get(
  '/dashboard',
  authMiddleware,
  requireRole('user', 'admin'),
  getDashboard
);

export default userRouter;
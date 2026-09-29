import { Router } from 'express';

import {
  getAdminPanel,
  getAllUsers,
} from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole';

const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireRole('admin'));

adminRouter.get('/users', getAllUsers);
adminRouter.get('/panel', getAdminPanel);

export default adminRouter;
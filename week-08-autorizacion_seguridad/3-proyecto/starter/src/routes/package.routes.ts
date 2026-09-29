import { Router } from 'express';

import {
  createPackage,
  deletePackage,
  getPackage,
  listPackages,
  updatePackage,
} from '../controllers/package.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole';

const packageRouter = Router();

packageRouter.use(authMiddleware);

packageRouter.get('/', listPackages);
packageRouter.get('/:id', getPackage);
packageRouter.post('/', createPackage);
packageRouter.patch('/:id', updatePackage);
packageRouter.delete('/:id', requireRole('admin'), deletePackage);

export default packageRouter;
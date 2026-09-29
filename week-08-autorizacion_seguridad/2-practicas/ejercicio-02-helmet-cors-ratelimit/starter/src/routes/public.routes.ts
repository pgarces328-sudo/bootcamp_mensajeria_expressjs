import { Router } from 'express';

import {
  getHealth,
  getPublicData,
} from '../controllers/public.controller';

const publicRouter = Router();

publicRouter.get('/health', getHealth);
publicRouter.get('/public', getPublicData);

export default publicRouter;
import { Router } from 'express';
import * as ctl from '../controllers/auth.controller';
const router = Router();
router.post('/register', ctl.registerCtrl);
router.post('/login', ctl.loginCtrl);
export default router;

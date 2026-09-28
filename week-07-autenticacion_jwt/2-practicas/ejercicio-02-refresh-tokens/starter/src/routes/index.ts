import { Router } from 'express';
import authRoutes from './auth.routes';
const router = Router();
router.use('/auth', authRoutes);
router.get('/health', (_req, res) => res.json({ ok: true }));
export default router;
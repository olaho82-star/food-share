import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createSupportIntent } from '../controllers/support.controller';

const router = Router();

router.use(requireAuth);
router.post('/donate', createSupportIntent);

export default router;
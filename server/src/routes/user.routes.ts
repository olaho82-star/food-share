import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getPublicProfile, updateMe } from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

router.get('/:id', getPublicProfile);
router.put('/me', updateMe);

export default router;

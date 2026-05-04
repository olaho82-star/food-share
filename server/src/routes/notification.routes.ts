import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getNotifications, markAllRead, savePushToken } from '../controllers/notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.post('/push-token', savePushToken);

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getConversations, getMessages, sendMessage } from '../controllers/message.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getConversations);
router.get('/:listingId', getMessages);
router.post('/:listingId', sendMessage);

export default router;

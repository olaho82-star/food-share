import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getConversations, getMessages, sendMessage, deleteMessage } from '../controllers/message.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getConversations);
router.get('/:listingId', getMessages);
router.post('/:listingId', sendMessage);
router.delete('/:messageId', deleteMessage);

export default router;

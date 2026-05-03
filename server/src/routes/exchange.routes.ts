import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getExchanges, getExchange, submitDonation, submitRating } from '../controllers/exchange.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getExchanges);
router.get('/:id', getExchange);
router.post('/:id/donate', submitDonation);
router.post('/:id/rate', submitRating);

export default router;

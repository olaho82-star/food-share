import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { subscribePremium, confirmPremium, cancelPremium, getPremiumStatus, handleWebhook } from '../controllers/premium.controller';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(requireAuth);
router.post('/subscribe', subscribePremium);
router.post('/confirm', confirmPremium);
router.post('/cancel', cancelPremium);
router.get('/status', getPremiumStatus);

export default router;
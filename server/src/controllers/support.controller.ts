import { Response } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth.middleware';

let _stripe: InstanceType<typeof Stripe> | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function createSupportIntent(req: AuthRequest, res: Response) {
  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount < 100) {
    res.status(400).json({ message: 'Minimum donation is £1.00' });
    return;
  }

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(amount),
    currency: 'gbp',
    automatic_payment_methods: { enabled: true },
    metadata: { type: 'app_support' },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}
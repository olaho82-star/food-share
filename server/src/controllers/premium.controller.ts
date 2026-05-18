import { Response, Request } from 'express';
import Stripe from 'stripe';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

let _stripe: InstanceType<typeof Stripe> | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

const MONTHLY_PRICE_GBP = 999; // £9.99 in pence

export async function subscribePremium(req: AuthRequest, res: Response) {
  try {
    console.log('[Premium] Subscribe request from user:', req.userId);
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (user.isPremium) { res.status(400).json({ message: 'Already subscribed' }); return; }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: MONTHLY_PRICE_GBP,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { type: 'premium_subscription', userId: String(req.userId) },
    });

    console.log('[Premium] Payment intent created:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret, subscriptionId: paymentIntent.id });
  } catch (err: any) {
    console.error('[Premium] Subscribe error:', err.message);
    res.status(500).json({ message: err.message || 'Subscription failed. Please try again.' });
  }
}

export async function confirmPremium(req: AuthRequest, res: Response) {
  try {
    const { subscriptionId } = req.body; // paymentIntentId in this simplified flow
    if (!subscriptionId) { res.status(400).json({ message: 'subscriptionId required' }); return; }

    // Verify payment succeeded before granting premium
    const pi = await getStripe().paymentIntents.retrieve(subscriptionId);
    if (pi.status !== 'succeeded') {
      res.status(400).json({ message: 'Payment has not been completed' }); return;
    }

    const premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await User.findByIdAndUpdate(req.userId, {
      isPremium: true,
      stripeSubscriptionId: subscriptionId,
      premiumSince: new Date(),
      premiumExpiresAt,
    });
    console.log('[Premium] Activated for user:', req.userId, 'expires:', premiumExpiresAt);
    res.json({ message: 'Premium activated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to confirm premium' });
  }
}

export async function confirmIAP(req: AuthRequest, res: Response) {
  try {
    const { revenueCatUserId } = req.body;
    if (!revenueCatUserId) { res.status(400).json({ message: 'revenueCatUserId required' }); return; }
    const premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(req.userId, {
      isPremium: true,
      stripeSubscriptionId: revenueCatUserId,
      premiumSince: new Date(),
      premiumExpiresAt,
    });
    console.log('[Premium] IAP confirmed for user:', req.userId);
    res.json({ message: 'Premium activated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to confirm IAP' });
  }
}

export async function cancelPremium(req: AuthRequest, res: Response) {
  try {
    const stripe = getStripe();
    const user = await User.findById(req.userId);
    if (!user || !user.stripeSubscriptionId) { res.status(400).json({ message: 'No active subscription' }); return; }
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    await User.findByIdAndUpdate(req.userId, {
      isPremium: false,
      stripeSubscriptionId: null,
      premiumSince: null,
    });
    res.json({ message: 'Subscription cancelled' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to cancel subscription' });
  }
}

export async function getPremiumStatus(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId).select('isPremium premiumSince stripeSubscriptionId');
  res.json({ isPremium: user?.isPremium ?? false, premiumSince: user?.premiumSince });
}

export async function handleWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    res.status(400).send('Webhook signature invalid');
    return;
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    await User.findOneAndUpdate(
      { stripeSubscriptionId: sub.id },
      { isPremium: false, stripeSubscriptionId: null, premiumSince: null }
    );
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any;
    if (invoice.subscription) {
      await User.findOneAndUpdate(
        { stripeSubscriptionId: invoice.subscription as string },
        { isPremium: false }
      );
    }
  }

  res.json({ received: true });
}
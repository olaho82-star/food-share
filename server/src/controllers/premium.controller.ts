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

async function getOrCreatePriceId(): Promise<string> {
  const stripe = getStripe();
  const existing = await stripe.prices.list({ active: true, limit: 100 });
  const found = existing.data.find(
    (p) => (p.metadata as Record<string, string>).foodlodge_plan === 'business'
  );
  if (found) return found.id;

  const product = await stripe.products.create({
    name: 'FoodLodge Business Plan',
    metadata: { foodlodge_plan: 'business' },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: MONTHLY_PRICE_GBP,
    currency: 'gbp',
    recurring: { interval: 'month' },
    metadata: { foodlodge_plan: 'business' },
  });

  return price.id;
}

export async function subscribePremium(req: AuthRequest, res: Response) {
  try {
    const stripe = getStripe();
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (user.isPremium) { res.status(400).json({ message: 'Already subscribed' }); return; }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    console.log('[Premium] Creating customer for user:', req.userId);
    const priceId = await getOrCreatePriceId();
    console.log('[Premium] Using price ID:', priceId);
    console.log('[Premium] Creating subscription...');

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;

    if (!paymentIntent?.client_secret) {
      res.status(500).json({ message: 'Failed to create payment intent. Please try again.' });
      return;
    }

    res.json({ clientSecret: paymentIntent.client_secret, subscriptionId: subscription.id });
  } catch (err: any) {
    console.error('[Premium] Subscribe error:', err.message);
    res.status(500).json({ message: err.message || 'Subscription failed. Please try again.' });
  }
}

export async function confirmPremium(req: AuthRequest, res: Response) {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) { res.status(400).json({ message: 'subscriptionId required' }); return; }
    await User.findByIdAndUpdate(req.userId, {
      isPremium: true,
      stripeSubscriptionId: subscriptionId,
      premiumSince: new Date(),
    });
    res.json({ message: 'Premium activated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to confirm premium' });
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
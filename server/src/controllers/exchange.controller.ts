import { Response } from 'express';
import { Exchange } from '../models/exchange.model';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getExchanges(req: AuthRequest, res: Response) {
  const field = req.userRole === 'donor' ? 'donorId' : 'recipientId';
  const exchanges = await Exchange.find({ [field]: req.userId })
    .populate('listingId', 'title borough pickupDate pickupFrom pickupUntil photoUrl category')
    .sort({ createdAt: -1 });
  res.json({ exchanges });
}

export async function getExchange(req: AuthRequest, res: Response) {
  const exchange = await Exchange.findById(req.params.id)
    .populate('listingId donorId recipientId');
  if (!exchange) { res.status(404).json({ message: 'Exchange not found' }); return; }

  const isParticipant = String(exchange.donorId) === req.userId || String(exchange.recipientId) === req.userId;
  if (!isParticipant) { res.status(403).json({ message: 'Forbidden' }); return; }

  res.json({ exchange });
}

export async function submitDonation(req: AuthRequest, res: Response) {
  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ message: 'A valid donation amount in pence is required' });
    return;
  }

  const exchange = await Exchange.findById(req.params.id);
  if (!exchange) { res.status(404).json({ message: 'Exchange not found' }); return; }
  if (String(exchange.recipientId) !== req.userId) { res.status(403).json({ message: 'Forbidden' }); return; }
  if (exchange.status !== 'completed' && exchange.status !== 'auto-completed') {
    res.status(400).json({ message: 'Exchange must be completed before donating' });
    return;
  }

  exchange.donationAmount = Math.round(amount);
  await exchange.save();

  await User.findByIdAndUpdate(exchange.donorId, {
    $inc: { totalDonationsReceived: Math.round(amount) },
  });

  res.json({ exchange });
}

export async function submitRating(req: AuthRequest, res: Response) {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ message: 'Rating must be between 1 and 5' });
    return;
  }

  const exchange = await Exchange.findById(req.params.id);
  if (!exchange) { res.status(404).json({ message: 'Exchange not found' }); return; }
  if (exchange.status !== 'completed' && exchange.status !== 'auto-completed') {
    res.status(400).json({ message: 'Exchange must be completed before rating' });
    return;
  }

  const isDonor = String(exchange.donorId) === req.userId;
  const isRecipient = String(exchange.recipientId) === req.userId;
  if (!isDonor && !isRecipient) { res.status(403).json({ message: 'Forbidden' }); return; }

  if (isDonor) {
    exchange.donorRating = rating;
    exchange.donorRatingComment = comment || null;
    const target = await User.findById(exchange.recipientId);
    if (target) {
      const newCount = target.ratingCount + 1;
      target.rating = ((target.rating * target.ratingCount) + rating) / newCount;
      target.ratingCount = newCount;
      await target.save();
    }
  } else {
    exchange.recipientRating = rating;
    exchange.donorRatingComment = comment || null;
    const target = await User.findById(exchange.donorId);
    if (target) {
      const newCount = target.ratingCount + 1;
      target.rating = ((target.rating * target.ratingCount) + rating) / newCount;
      target.ratingCount = newCount;
      await target.save();
    }
  }

  await exchange.save();
  res.json({ exchange });
}

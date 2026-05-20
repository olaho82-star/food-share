import { Response } from 'express';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { Exchange } from '../models/exchange.model';
import { Message } from '../models/message.model';
import { Notification } from '../models/notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getPublicProfile(req: AuthRequest, res: Response) {
  const user = await User.findById(req.params.id).select(
    'name borough rating ratingCount donationsCount collectionsCount foodSavedKg createdAt'
  );
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json({ user });
}

export async function updateMe(req: AuthRequest, res: Response) {
  const allowed = ['name', 'borough', 'anonymousDonations', 'searchRadiusMiles', 'foodPreferences'];
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select(
    '-passwordHash -passwordResetToken -passwordResetExpires -expoPushToken'
  );
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json({ user });
}

export async function deleteMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
    await Notification.deleteMany({ userId });
    await Exchange.deleteMany({ $or: [{ donorId: userId }, { recipientId: userId }] });
    await Listing.deleteMany({ donorId: userId });
    await User.findByIdAndDelete(userId);
    console.log('[User] Account deleted:', userId);
    res.json({ message: 'Account deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete account' });
  }
}

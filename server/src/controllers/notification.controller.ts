import { Response } from 'express';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getNotifications(req: AuthRequest, res: Response) {
  const notifications = await Notification.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ notifications });
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
}

export async function savePushToken(req: AuthRequest, res: Response) {
  const { token } = req.body;
  if (!token) { res.status(400).json({ message: 'Token is required' }); return; }
  await User.findByIdAndUpdate(req.userId, { expoPushToken: token });
  res.json({ message: 'Push token saved' });
}

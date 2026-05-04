import { User } from '../models/user.model';
import { Notification, NotificationType } from '../models/notification.model';

interface PushPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: string;
}

export async function sendNotification(payload: PushPayload) {
  const { userId, type, title, body, relatedId } = payload;

  await Notification.create({ userId, type, title, body, relatedId: relatedId || null });

  const user = await User.findById(userId).select('expoPushToken');
  if (!user || !(user as any).expoPushToken) return;

  const token = (user as any).expoPushToken as string;
  if (!token.startsWith('ExponentPushToken')) return;

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: token, title, body, data: { type, relatedId } }),
    });
  } catch (err) {
    console.error('Push notification failed:', err);
  }
}

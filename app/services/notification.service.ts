import { api } from './api';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
}

interface NotificationsResponse { notifications: AppNotification[] }

export const notificationService = {
  getNotifications: () => api.get<NotificationsResponse>('/api/notifications'),
  markAllRead: () => api.put<{ message: string }>('/api/notifications/read-all', {}),
};

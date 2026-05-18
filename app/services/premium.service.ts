import { api } from './api';

export const premiumService = {
  getStatus: () => api.get<{ isPremium: boolean; premiumSince?: string }>('/api/premium/status'),
  subscribe: (amount: number) => api.post<{ clientSecret: string; subscriptionId: string }>('/api/premium/subscribe', { amount }),
  confirm: (subscriptionId: string) => api.post<{ message: string }>('/api/premium/confirm', { subscriptionId }),
  cancel: () => api.post<{ message: string }>('/api/premium/cancel', {}),
  confirmIAP: (revenueCatUserId: string) => api.post<{ message: string }>('/api/premium/confirm-iap', { revenueCatUserId }),
  createSupportIntent: (amount: number) => api.post<{ clientSecret: string }>('/api/support/donate', { amount }),
};
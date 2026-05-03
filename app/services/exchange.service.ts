import { api } from './api';
import { Exchange } from '../types';

interface ExchangesResponse { exchanges: Exchange[] }
interface ExchangeResponse { exchange: Exchange }

export const exchangeService = {
  getExchanges: () => api.get<ExchangesResponse>('/api/exchanges'),
  getExchange: (id: string) => api.get<ExchangeResponse>(`/api/exchanges/${id}`),
  submitDonation: (id: string, amountPence: number) =>
    api.post<ExchangeResponse>(`/api/exchanges/${id}/donate`, { amount: amountPence }),
  submitRating: (id: string, rating: number, comment?: string) =>
    api.post<ExchangeResponse>(`/api/exchanges/${id}/rate`, { rating, comment }),
};

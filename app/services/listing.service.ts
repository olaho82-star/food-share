import { api } from './api';
import { Listing } from '../types';

interface ListingsResponse { listings: Listing[] }
interface ListingResponse { listing: Listing }

export const listingService = {
  getMyListings: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<ListingsResponse>(`/api/listings${query}`);
  },
  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get<ListingsResponse>(`/api/listings/nearby?lat=${lat}&lng=${lng}&radius=${radius ?? 5}`),
  getListing: (id: string) => api.get<ListingResponse>(`/api/listings/${id}`),
  createListing: (data: Partial<Listing>) => api.post<ListingResponse>('/api/listings', data),
  updateListing: (id: string, data: Partial<Listing>) => api.put<ListingResponse>(`/api/listings/${id}`, data),
  deleteListing: (id: string) => api.delete<{ message: string }>(`/api/listings/${id}`),
  claimListing: (id: string) => api.post<ListingResponse>(`/api/listings/${id}/claim`, {}),
  markCollected: (id: string) => api.post<ListingResponse>(`/api/listings/${id}/collected`, {}),
  confirmCollection: (id: string) => api.post<ListingResponse>(`/api/listings/${id}/confirm`, {}),
};

import { api } from './api';
import { User } from '../types';

interface UserResponse { user: User }

export const userService = {
  getProfile: (id: string) => api.get<UserResponse>(`/api/users/${id}`),
  updateMe: (data: Partial<Pick<User, 'name' | 'borough' | 'anonymousDonations' | 'searchRadiusMiles' | 'foodPreferences'>>) =>
    api.put<UserResponse>('/api/users/me', data),
};

import { api } from './api';
import { User, AuthTokens } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'donor' | 'recipient';
    disclaimerAccepted: boolean;
  }) => api.post<AuthResponse>('/api/auth/register', data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/api/auth/reset-password', { token, password }),

  getMe: () => api.get<{ user: User }>('/api/auth/me'),
};

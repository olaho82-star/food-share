import { create } from 'zustand';
import { User, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: true,
  setAuth: (user, tokens) => set({ user, tokens, isLoading: false }),
  clearAuth: () => set({ user: null, tokens: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

import { storage } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const stored = await storage.loadAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (stored?.accessToken) {
    headers['Authorization'] = `Bearer ${stored.accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

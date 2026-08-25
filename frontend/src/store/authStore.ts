import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../services/api';

export interface LoginResult {
  requiresTelegram?: boolean;
  requiresTelegramLink?: boolean;
  challengeId?: string;
  linkUrl?: string;
  linkToken?: string;
  expiresAt?: string;
  message?: string;
  linked?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  continueTelegramLink: (linkToken: string) => Promise<LoginResult>;
  verifyTelegram: (challengeId: string, code: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'STUDENT';
  }) => Promise<LoginResult>;
}

function parseAuthPayload(payload: Record<string, unknown>): LoginResult {
  if (payload.requiresTelegramLink && payload.linkUrl && payload.linkToken) {
    return {
      requiresTelegramLink: true,
      linkUrl: String(payload.linkUrl),
      linkToken: String(payload.linkToken),
      message: payload.message ? String(payload.message) : undefined,
    };
  }
  if (payload.requiresTelegram && payload.challengeId) {
    return {
      requiresTelegram: true,
      challengeId: String(payload.challengeId),
      expiresAt: payload.expiresAt ? String(payload.expiresAt) : undefined,
      message: payload.message ? String(payload.message) : undefined,
      linked: payload.linked === true ? true : undefined,
    };
  }
  return {
    linked: payload.linked === false ? false : payload.linked === true ? true : undefined,
    message: payload.message ? String(payload.message) : undefined,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      setSession: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      fetchMe: async () => {
        if (!get().token) return;
        set({ loading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data, loading: false });
        } catch {
          set({ user: null, token: null, loading: false });
        }
      },
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const payload = data.data as Record<string, unknown>;
        const parsed = parseAuthPayload(payload);
        if (parsed.requiresTelegram || parsed.requiresTelegramLink) return parsed;
        if (payload.user && payload.token) {
          set({ user: payload.user as User, token: String(payload.token) });
        }
        return {};
      },
      continueTelegramLink: async (linkToken) => {
        const { data } = await api.post('/auth/telegram/continue', { linkToken });
        return parseAuthPayload(data.data as Record<string, unknown>);
      },
      verifyTelegram: async (challengeId, code) => {
        const { data } = await api.post('/auth/verify-telegram', { challengeId, code });
        set({ user: data.data.user, token: data.data.token });
      },
      register: async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        const body = data.data as Record<string, unknown>;
        const parsed = parseAuthPayload(body);
        if (parsed.requiresTelegram || parsed.requiresTelegramLink) return parsed;
        if (body.user && body.token) {
          set({ user: body.user as User, token: String(body.token) });
        }
        return {};
      },
    }),
    { name: 'educrm-auth' },
  ),
);

import { create } from "zustand";
import {
  saveTokens,
  clearTokens,
  getUserFromToken,
  getAccessToken,
} from "@/lib/auth";
import api from "@/lib/api";

interface User {
  email: string;
  userId: number;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  initAuth: () => {
    const token = getAccessToken();
    if (token) {
      const user = getUserFromToken(token);
      set({ user, isAuthenticated: !!user });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { accessToken, refreshToken } = res.data;
      saveTokens(accessToken, refreshToken);
      const user = getUserFromToken(accessToken);
      set({ user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken } = res.data;
      saveTokens(accessToken, refreshToken);
      const user = getUserFromToken(accessToken);
      set({ user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
    window.location.href = "/login";
  },
}));
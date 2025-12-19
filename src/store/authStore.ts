import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  accessToken: string | null; // 메모리에만 저장 (15분 만료)
  user: User | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      login: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
      // accessToken은 persist에서 제외 (메모리에만 저장)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


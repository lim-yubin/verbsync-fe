import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
    }
  )
);


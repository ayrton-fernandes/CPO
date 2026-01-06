import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { MOCK_USERS } from '@/services/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mapeamento expandido conforme nova reunião
const CREDENTIALS_MAP: Record<string, string> = {
  'admin': 'u-master',
  'gerente': 'u-gerente',
  'analista': 'u-analista',
  'investigador': 'u-investigador',
  'planejamento': 'u-planejamento',
  'gestao': 'u-gestao',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username, password) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (password === '123' && CREDENTIALS_MAP[username]) {
          const userId = CREDENTIALS_MAP[username];
          const foundUser = MOCK_USERS.find((u) => u.id === userId);

          if (foundUser) {
            set({ user: foundUser, isAuthenticated: true });
            return true;
          }
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
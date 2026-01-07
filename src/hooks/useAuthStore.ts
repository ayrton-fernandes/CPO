import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { usersService } from '@/services/usersService';
import { toast } from 'sonner';

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

        // In a real app, this would be an API call. 
        // For the prototype, we check the local database.
        
        const allUsers = usersService.getAll();
        
        // Check for direct email login OR mapped credentials
        const userId = CREDENTIALS_MAP[username];
        const foundUser = allUsers.find((u) => u.id === userId || u.email === username);

        if (foundUser && (password === '123' || password === '123456')) {
          // Check for expiration
          if (foundUser.expirationDate) {
            const [year, month, day] = foundUser.expirationDate.split("-").map(Number);
            const expDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            const now = new Date();
            
            // Set time to end of day for expiration check
            expDate.setHours(23, 59, 59, 999);
            
            if (now > expDate) {
              toast.error("Acesso expirado em " + expDate.toLocaleDateString());
              return false;
            }
          }

          set({ user: foundUser, isAuthenticated: true });
          return true;
        }
        
        toast.error("Credenciais inválidas");
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
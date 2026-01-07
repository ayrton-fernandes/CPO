import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { usersService } from '@/services/usersService';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginTimestamp: number | null;
  isHydrated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => void;
  refreshUser: () => void;
  setHydrated: (val: boolean) => void;
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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loginTimestamp: null,
      isHydrated: false,
      setHydrated: (val) => set({ isHydrated: val }),
      login: async (username, password) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const allUsers = usersService.getAll();
        const userId = CREDENTIALS_MAP[username];
        const foundUser = allUsers.find((u) => u.id === userId || u.email === username);

        if (foundUser && (password === '123' || password === '123456')) {
          if (foundUser.expirationDate) {
            const [year, month, day] = foundUser.expirationDate.split("-").map(Number);
            const expDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            const now = new Date();
            
            if (now > expDate) {
              toast.error("Acesso expirado em " + expDate.toLocaleDateString());
              return false;
            }
          }

          set({ 
            user: foundUser, 
            isAuthenticated: true, 
            loginTimestamp: Date.now() 
          });
          return true;
        }
        
        toast.error("Credenciais inválidas");
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, loginTimestamp: null });
        if (typeof window !== 'undefined') {
            window.location.href = "/login";
        }
      },
      checkSession: () => {
        const { loginTimestamp, isAuthenticated, logout } = get();
        if (!isAuthenticated || !loginTimestamp) return;

        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (now - loginTimestamp > thirtyMinutes) {
          toast.error("Sessão expirada por inatividade.");
          logout();
        } else {
          // Soft refresh of timestamp on activity
          set({ loginTimestamp: now });
        }
      },
      refreshUser: () => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return;

        const updatedUser = usersService.getById(user.id);
        if (updatedUser) {
            // Only update if data actually changed to avoid unnecessary renders
            if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                set({ user: updatedUser });
            }
        } else {
            // User was deleted
            get().logout();
        }
      }
    }),
    {
      name: 'cpo_session',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);
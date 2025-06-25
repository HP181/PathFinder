import { create } from 'zustand';
import { getUserRole } from '../Firebase/Auth';
import {auth} from "../Firebase/Config"
import { User } from 'firebase/auth';
import { UserRole } from '../Firebase/Auth';

interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userRole: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false,
  }),
  setUserRole: (userRole) => set({ userRole }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

// Initialize auth listener
export const initializeAuth = () => {
  auth.onAuthStateChanged(async (user) => {
    const authStore = useAuthStore.getState();
    
    if (user) {
      const role = await getUserRole(user);
      authStore.setUser(user);
      authStore.setUserRole(role);
    } else {
      authStore.setUser(null);
      authStore.setUserRole(null);
    }
    
    authStore.setIsLoading(false);
  });
};
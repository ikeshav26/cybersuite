import { create } from 'zustand';

interface LoginHistory {
  loggedInAt: string;
  ip: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  device?: {
    browser?: string;
    os?: string;
  };
  isp?: string;
}

interface User {
  _id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'serviceProvider';
  createdAt?: string;
  verified?: boolean;
  loginHistory?: LoginHistory[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  activeTab: string;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setActiveTab: (tab: string) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  activeTab: 'profile',
  
  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  
  clearAuth: () => {
    set({ user: null, token: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  initAuth: () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          set({ user, token: storedToken, isAuthenticated: true });
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    }
  },
}));

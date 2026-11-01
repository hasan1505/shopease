'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { authService } from '@/lib/services';
import type { AuthState, LoginPayload, RegisterPayload, User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('shopease_token');
    const userRaw = localStorage.getItem('shopease_user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as User;
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('shopease_token');
        localStorage.removeItem('shopease_user');
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const persist = (token: string, user: User) => {
    localStorage.setItem('shopease_token', token);
    localStorage.setItem('shopease_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    persist(res.token, res.user);
    toast.success(`Welcome back, ${res.user.name}!`);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    persist(res.token, res.user);
    toast.success(`Account created! Welcome, ${res.user.name}!`);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('shopease_token');
    localStorage.removeItem('shopease_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('shopease_user', JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

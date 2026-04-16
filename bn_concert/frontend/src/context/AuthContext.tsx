import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getItem, setItem, deleteItem } from '../utils/storage';
import { authApi, userApi } from '../api/services';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = await getItem('access_token');
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      const { data } = await userApi.getMe();
      setState({ user: data, isLoading: false, isAuthenticated: true });
    } catch {
      await deleteItem('access_token');
      await deleteItem('refresh_token');
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    await setItem('access_token', data.access_token);
    await setItem('refresh_token', data.refresh_token);
    const me = await userApi.getMe();
    setState({ user: me.data, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (regData: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
    const { data } = await authApi.register(regData);
    await setItem('access_token', data.access_token);
    await setItem('refresh_token', data.refresh_token);
    const me = await userApi.getMe();
    setState({ user: me.data, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await deleteItem('access_token');
    await deleteItem('refresh_token');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await userApi.getMe();
      setState((prev) => ({ ...prev, user: data }));
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

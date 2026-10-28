import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setOnUnauthenticated, clearCsrfToken } from '../../lib/api';
import { useMe, useLogin, useLogout } from './hooks';
import type { User, LoginInput, AuthStatus } from './types';

export interface AuthContextValue {
  user: User | null;
  role: string | null;
  status: AuthStatus;
  login: (data: LoginInput) => Promise<unknown>;
  logout: () => Promise<unknown>;
  hasRole: (roles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user = null, isLoading } = useMe();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const status: AuthStatus = isLoading
    ? 'loading'
    : user
      ? 'authenticated'
      : 'unauthenticated';

  useEffect(() => {
    setOnUnauthenticated(() => {
      queryClient.clear();
      clearCsrfToken();
    });
    return () => setOnUnauthenticated(null);
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    role: user?.role || null,
    status,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    hasRole: (roles: string[]) => (user ? roles.includes(user.role) : false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

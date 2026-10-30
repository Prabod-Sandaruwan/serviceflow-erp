import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { Skeleton } from '../components/states/Skeleton';
import { UnauthorisedPage } from '../features/auth/UnauthorisedPage';

export interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <Skeleton />;
  }

  if (status === 'unauthenticated') {
    const from = location.pathname !== '/logout' ? location : undefined;
    return <Navigate to="/login" state={from ? { from } : undefined} replace />;
  }

  if (user?.mustChangePassword && location.pathname !== '/profile/password') {
    return <Navigate to="/profile/password" replace />;
  }

  return <>{children}</>;
}

export interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { status, user, hasRole } = useAuth();

  if (status === 'loading') {
    return <Skeleton />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/profile/password" replace />;
  }

  if (!hasRole(roles)) {
    return <UnauthorisedPage />;
  }

  return <>{children}</>;
}

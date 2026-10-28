import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { Skeleton } from '../components/states/Skeleton';
import { UnauthorisedPage } from '../features/auth/UnauthorisedPage';

export interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <Skeleton />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { status, hasRole } = useAuth();

  if (status === 'loading') {
    return <Skeleton />;
  }

  if (!hasRole(roles)) {
    return <UnauthorisedPage />;
  }

  return <>{children}</>;
}

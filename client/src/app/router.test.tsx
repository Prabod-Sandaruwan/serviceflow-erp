import { describe, it, expect } from 'vitest';
import type { RouteObject } from 'react-router-dom';
import { router } from './router';

describe('Router configuration', () => {
  const expectedPaths = [
    '/login',
    '/',
    '/profile',
    '/clients',
    '/leads',
    '/follow-ups',
    '/quotations',
    '/projects',
    '/tasks',
    '/invoices',
    '/expenses',
    '/reports/finance',
    '/reports/projects',
    '/admin/users',
    '/admin/employees',
    '/admin/audit',
    '*',
  ];

  const getPaths = (routes: RouteObject[], parent = ''): string[] => {
    return routes.flatMap((r) => {
      const fullPath = r.index
        ? parent || '/'
        : r.path
          ? r.path.startsWith('/') || r.path === '*'
            ? r.path
            : `${parent}/${r.path}`.replace(/\/+/g, '/')
          : parent;
      return [fullPath, ...(r.children ? getPaths(r.children, fullPath) : [])];
    });
  };

  it('defines all required application routes', () => {
    const configuredPaths = getPaths(router.routes);
    expectedPaths.forEach((path) => {
      expect(configuredPaths).toContain(path);
    });
  });

  it('contains fallback 404 route', () => {
    const catchAllRoute = router.routes.find((route) => route.path === '*');
    expect(catchAllRoute).toBeDefined();
    expect(catchAllRoute?.element).toBeDefined();
  });
});

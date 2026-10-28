import { describe, it, expect } from 'vitest';
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

  it('defines all required application routes', () => {
    const configuredPaths = router.routes.map((route) => route.path);
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

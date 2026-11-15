import { Router, Request, Response } from 'express';
import { ok } from '../../shared/http';
import { ensureCsrfToken } from '../../middleware/csrf';
import { loginLimiter } from '../../middleware/loginLimiter';
import { AuthController } from './auth.controller';
import { AuthMeController } from './auth.me.controller';
import { registry } from '../../config/openapi';
import { route } from '../../shared/routeRegistry';

const router = Router();

route(router, 'get', '/csrf', {
  roles: 'PUBLIC',
  handler: (req: Request, res: Response, next: any) => {
    const csrfToken = ensureCsrfToken(req);
    req.session.save((err) => (err ? next(err) : ok(res, { csrfToken })));
  },
});

route(router, 'post', '/login', { roles: 'PUBLIC', handler: [loginLimiter, AuthController.login] });
route(router, 'post', '/logout', { roles: 'PUBLIC', handler: AuthController.logout });
route(router, 'get', '/me', { roles: ['ADMIN', 'MANAGER', 'STAFF'], handler: AuthController.me });
route(router, 'patch', '/me', {
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  handler: AuthMeController.updateMe,
});
route(router, 'post', '/logout-other-sessions', {
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  handler: AuthMeController.logoutOtherSessions,
});
route(router, 'post', '/change-password', {
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  handler: AuthController.changePassword,
});
route(router, 'patch', '/me/password', {
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  handler: AuthController.changePassword,
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/csrf',
  summary: 'Issue CSRF token',
  responses: { 200: { description: 'CSRF token returned' } },
});
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'User login',
  responses: {
    200: { description: 'Login successful' },
    401: { description: 'Invalid credentials' },
  },
});
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  summary: 'User logout',
  responses: { 204: { description: 'Logout successful' } },
});
registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  summary: 'Get current user profile',
  responses: { 200: { description: 'Profile returned' }, 401: { description: 'Unauthenticated' } },
});
registry.registerPath({
  method: 'patch',
  path: '/api/v1/auth/me',
  summary: 'Update current user profile',
  responses: { 200: { description: 'Profile updated' }, 401: { description: 'Unauthenticated' } },
});
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout-other-sessions',
  summary: 'Logout other sessions',
  responses: { 200: { description: 'Sessions purged' }, 401: { description: 'Unauthenticated' } },
});
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/change-password',
  summary: 'Change password',
  responses: {
    204: { description: 'Password changed successfully' },
    422: { description: 'Validation error' },
  },
});

export const authRoutes = router;
export default router;

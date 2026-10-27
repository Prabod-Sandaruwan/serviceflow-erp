import { Router, Request, Response } from 'express';
import { ok } from '../../shared/http';
import { ensureCsrfToken } from '../../middleware/csrf';
import { AuthController } from './auth.controller';
import { registry } from '../../config/openapi';

const router = Router();

router.get('/csrf', (req: Request, res: Response) => {
  const csrfToken = ensureCsrfToken(req);
  ok(res, { csrfToken });
});

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);

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
    403: { description: 'Invalid CSRF token' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  summary: 'User logout',
  responses: {
    204: { description: 'Logout successful' },
    403: { description: 'Invalid CSRF token' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  summary: 'Get current user profile',
  responses: {
    200: { description: 'Profile returned' },
    401: { description: 'Unauthenticated' },
  },
});

export const authRoutes = router;
export default router;

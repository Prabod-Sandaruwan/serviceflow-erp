import { Router } from 'express';
import { list, create, update } from './followups.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const roles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'get', '/', { roles, handler: [requireAuth, requireRole(roles), list] });
route(router, 'post', '/', { roles, handler: [requireAuth, requireRole(roles), create] });
route(router, 'patch', '/:id', { roles, handler: [requireAuth, requireRole(roles), update] });

registry.registerPath({
  method: 'get',
  path: '/api/v1/follow-ups',
  summary: 'List follow-ups with scoping and pagination',
  responses: { 200: { description: 'Paginated follow-up list' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/follow-ups',
  summary: 'Create a new follow-up',
  responses: { 201: { description: 'Follow-up created' }, 401: { description: 'Unauthenticated' }, 422: { description: 'Validation error' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/follow-ups/{id}',
  summary: 'Update follow-up status and schedule',
  responses: {
    200: { description: 'Follow-up updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    422: { description: 'Validation error' },
  },
});

export const followUpRoutes = router;
export default router;

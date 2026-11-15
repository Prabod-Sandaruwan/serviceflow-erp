import { Router } from 'express';
import { list, stats, getById, create, update } from './clients.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const roles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'get', '/stats', { roles, handler: [requireAuth, requireRole(roles), stats] });
route(router, 'get', '/', { roles, handler: [requireAuth, requireRole(roles), list] });
route(router, 'post', '/', { roles, handler: [requireAuth, requireRole(roles), create] });
route(router, 'get', '/:id', { roles, handler: [requireAuth, requireRole(roles), getById] });
route(router, 'patch', '/:id', { roles, handler: [requireAuth, requireRole(roles), update] });

registry.registerPath({
  method: 'get',
  path: '/api/v1/clients/stats',
  summary: 'Get client aggregate statistics',
  responses: { 200: { description: 'Client statistics' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/clients',
  summary: 'List clients with pagination and filtering',
  responses: {
    200: { description: 'Paginated client list' },
    401: { description: 'Unauthenticated' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/clients',
  summary: 'Create a client record',
  responses: {
    201: { description: 'Client created' },
    401: { description: 'Unauthenticated' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/clients/{id}',
  summary: 'Get client details by ID',
  responses: {
    200: { description: 'Client details' },
    401: { description: 'Unauthenticated' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/clients/{id}',
  summary: 'Update client details',
  responses: {
    200: { description: 'Client updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
  },
});

export const clientRoutes = router;
export default router;

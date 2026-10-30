import { Router } from 'express';
import { list, getById, create, update, convert } from './leads.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const roles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'get', '/', { roles, handler: [requireAuth, requireRole(roles), list] });
route(router, 'post', '/', { roles, handler: [requireAuth, requireRole(roles), create] });
route(router, 'get', '/:id', { roles, handler: [requireAuth, requireRole(roles), getById] });
route(router, 'patch', '/:id', { roles, handler: [requireAuth, requireRole(roles), update] });
route(router, 'post', '/:id/convert', { roles, handler: [requireAuth, requireRole(roles), convert] });

registry.registerPath({
  method: 'get',
  path: '/api/v1/leads',
  summary: 'List leads with scoping and pagination',
  responses: { 200: { description: 'Paginated lead list' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/leads',
  summary: 'Create a new lead',
  responses: { 201: { description: 'Lead created' }, 401: { description: 'Unauthenticated' }, 422: { description: 'Validation error' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/leads/{id}',
  summary: 'Get lead details by ID',
  responses: { 200: { description: 'Lead details' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/leads/{id}',
  summary: 'Update lead status and details',
  responses: {
    200: { description: 'Lead updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Invalid state transition' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/leads/{id}/convert',
  summary: 'Convert lead to client',
  responses: {
    200: { description: 'Lead converted' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Lead already converted' },
  },
});

export const leadRoutes = router;
export default router;

import { Router } from 'express';
import { create, list, getById, update } from './projects.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), list],
});

route(router, 'get', '/:id', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), getById],
});

route(router, 'post', '/', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});

route(router, 'patch', '/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), update],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/projects',
  summary: 'List projects',
  responses: { 200: { description: 'Paginated projects list' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/projects/{id}',
  summary: 'Get project details',
  responses: { 200: { description: 'Project details' }, 401: { description: 'Unauthenticated' }, 404: { description: 'Project not found' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/projects',
  summary: 'Create project from accepted quotation',
  responses: {
    201: { description: 'Project created' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Quotation not found' },
    409: { description: 'Quotation not accepted or project already exists' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/projects/{id}',
  summary: 'Update project status or details',
  responses: {
    200: { description: 'Project updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Project not found' },
    409: { description: 'Invalid transition or open work' },
    422: { description: 'Validation error' },
  },
});

export const projectRoutes = router;
export default router;

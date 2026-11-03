import { Router } from 'express';
import { create, update, approve } from './milestones.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'post', '/projects/:id/milestones', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});

route(router, 'patch', '/milestones/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), update],
});

route(router, 'post', '/milestones/:id/approve', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), approve],
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/projects/{id}/milestones',
  summary: 'Create project milestone',
  responses: {
    201: { description: 'Milestone created' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Project not found' },
    409: { description: 'Project cancelled' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/milestones/{id}',
  summary: 'Update milestone',
  responses: {
    200: { description: 'Milestone updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Milestone not found' },
    409: { description: 'Project cancelled or invalid status transition' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/milestones/{id}/approve',
  summary: 'Approve completed milestone',
  responses: {
    200: { description: 'Milestone approved' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Milestone not found' },
    409: { description: 'Invalid state transition' },
  },
});

export const milestoneRoutes = router;
export default router;

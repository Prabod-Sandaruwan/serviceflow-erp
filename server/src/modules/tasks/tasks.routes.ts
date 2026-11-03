import { Router } from 'express';
import { create, update } from './tasks.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'post', '/projects/:id/tasks', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});

route(router, 'patch', '/tasks/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), update],
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/projects/{id}/tasks',
  summary: 'Create project task',
  responses: {
    201: { description: 'Task created' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Project not found' },
    409: { description: 'Project cancelled' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/tasks/{id}',
  summary: 'Update task',
  responses: {
    200: { description: 'Task updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Task not found' },
    409: { description: 'Project cancelled or invalid status transition' },
    422: { description: 'Validation error' },
  },
});

export const taskRoutes = router;
export default router;

import { Router } from 'express';
import { list, listByProject, create, update } from './tasks.controller';
import { getTaskStats } from './tasks.stats';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/tasks', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), list],
});

route(router, 'get', '/tasks/stats', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), getTaskStats],
});

route(router, 'get', '/projects/:id/tasks', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), listByProject],
});

route(router, 'post', '/projects/:id/tasks', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});

route(router, 'patch', '/tasks/:id', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), update],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/tasks',
  summary: 'List tasks with filtering and pagination',
  responses: { 200: { description: 'Task list' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/tasks/stats',
  summary: 'Get tasks statistics breakdown',
  responses: { 200: { description: 'Tasks stats' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/projects/{id}/tasks',
  summary: 'List project tasks',
  responses: { 200: { description: 'Task list' }, 401: { description: 'Unauthenticated' } },
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
    422: { description: 'Validation error' },
  },
});

export const taskRoutes = router;
export default router;

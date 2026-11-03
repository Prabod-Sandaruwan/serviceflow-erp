import { Router } from 'express';
import { create, update, approve, listByProject, getById } from './milestones.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/projects/:id/milestones', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), listByProject],
});

route(router, 'post', '/projects/:id/milestones', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});

route(router, 'get', '/milestones/:id', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), getById],
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
  method: 'get',
  path: '/api/v1/projects/{id}/milestones',
  summary: 'List project milestones',
  responses: { 200: { description: 'Project milestones' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/projects/{id}/milestones',
  summary: 'Create project milestone',
  responses: { 201: { description: 'Milestone created' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/milestones/{id}',
  summary: 'Get milestone details',
  responses: { 200: { description: 'Milestone details' }, 401: { description: 'Unauthenticated' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/milestones/{id}',
  summary: 'Update milestone',
  responses: { 200: { description: 'Milestone updated' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/milestones/{id}/approve',
  summary: 'Approve completed milestone',
  responses: { 200: { description: 'Milestone approved' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

export const milestoneRoutes = router;
export default router;

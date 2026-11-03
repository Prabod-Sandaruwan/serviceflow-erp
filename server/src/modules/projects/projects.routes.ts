import { Router } from 'express';
import { create } from './projects.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'post', '/', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
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

export const projectRoutes = router;
export default router;


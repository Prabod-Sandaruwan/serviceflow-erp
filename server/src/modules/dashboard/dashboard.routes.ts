import { Router } from 'express';
import { getDashboardSummaryHandler } from './dashboard.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'get', '/dashboard/summary', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), getDashboardSummaryHandler],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/dashboard/summary',
  summary: 'Dashboard summary metrics and financial overview',
  responses: {
    200: { description: 'Role-based dashboard summary' },
    401: { description: 'Unauthorized' },
  },
});

export const dashboardRoutes = router;
export default router;

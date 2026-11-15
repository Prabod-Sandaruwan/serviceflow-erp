import { Router } from 'express';
import {
  getFinanceReportHandler,
  getProjectsReportHandler,
  exportCsvReportHandler,
} from './reports.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/reports/finance', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), getFinanceReportHandler],
});

route(router, 'get', '/reports/projects', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), getProjectsReportHandler],
});

route(router, 'get', '/reports/export.csv', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), exportCsvReportHandler],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports/finance',
  summary: 'Financial summary report',
  responses: {
    200: { description: 'Finance report' },
    403: { description: 'Forbidden' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports/projects',
  summary: 'Projects profitability report',
  responses: {
    200: { description: 'Projects report' },
    403: { description: 'Forbidden' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports/export.csv',
  summary: 'Export report to CSV',
  responses: {
    200: { description: 'CSV export' },
    403: { description: 'Forbidden' },
    422: { description: 'Validation error' },
  },
});

export const reportRoutes = router;
export default router;

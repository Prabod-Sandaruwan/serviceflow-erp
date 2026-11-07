import { Router } from 'express';
import { createExpenseHandler, updateExpenseHandler } from './expenses.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'post', '/expenses', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), createExpenseHandler],
});

route(router, 'patch', '/expenses/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), updateExpenseHandler],
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/expenses',
  summary: 'Create expense',
  responses: { 201: { description: 'Expense created' }, 403: { description: 'Forbidden' }, 422: { description: 'Validation error' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/expenses/{id}',
  summary: 'Update expense',
  responses: { 200: { description: 'Expense updated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
});

export const expenseRoutes = router;
export default router;

import { Router } from 'express';
import {
  createExpenseHandler,
  updateExpenseHandler,
  voidExpenseHandler,
  listExpensesHandler,
} from './expenses.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/expenses', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), listExpensesHandler],
});

route(router, 'post', '/expenses', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), createExpenseHandler],
});

route(router, 'patch', '/expenses/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), updateExpenseHandler],
});

route(router, 'post', '/expenses/:id/void', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), voidExpenseHandler],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/expenses',
  summary: 'List expenses',
  responses: { 200: { description: 'Expenses list' }, 401: { description: 'Unauthorized' } },
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

registry.registerPath({
  method: 'post',
  path: '/api/v1/expenses/{id}/void',
  summary: 'Void expense',
  responses: { 200: { description: 'Expense voided' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' }, 409: { description: 'Already voided' } },
});

export const expenseRoutes = router;
export default router;

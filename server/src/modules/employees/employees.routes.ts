import { Router } from 'express';
import { EmployeesController } from './employees.controller';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();

route(router, 'get', '/', { roles: ['ADMIN', 'MANAGER'], handler: EmployeesController.list });
route(router, 'post', '/', { roles: ['ADMIN'], handler: EmployeesController.create });
route(router, 'patch', '/:id', { roles: ['ADMIN'], handler: EmployeesController.update });

registry.registerPath({
  method: 'get',
  path: '/api/v1/employees',
  summary: 'List employees with pagination and filtering',
  responses: {
    200: { description: 'Paginated employee list returned' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/employees',
  summary: 'Create an employee',
  responses: {
    201: { description: 'Employee created' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
    409: { description: 'Duplicate email' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/employees/{id}',
  summary: 'Update an employee',
  responses: {
    200: { description: 'Employee updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
    404: { description: 'Employee not found' },
    409: { description: 'Duplicate email' },
  },
});

export const employeeRoutes = router;
export default router;

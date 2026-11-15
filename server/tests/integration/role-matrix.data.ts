export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface RoleMatrixItem {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  payload?: Record<string, any>;
  allowedRoles: Role[];
  forbiddenRoles: Role[];
}

export const roleMatrix: RoleMatrixItem[] = [
  {
    name: 'Leads - Create',
    method: 'POST',
    url: '/api/v1/leads',
    payload: { expectedValue: 10000 },
    allowedRoles: ['ADMIN', 'MANAGER', 'STAFF'],
    forbiddenRoles: [],
  },
  {
    name: 'Quotations - Create',
    method: 'POST',
    url: '/api/v1/quotations',
    allowedRoles: ['ADMIN', 'MANAGER', 'STAFF'],
    forbiddenRoles: [],
  },
  {
    name: 'Quotations - Approve',
    method: 'POST',
    url: '/api/v1/quotations/999999/approve',
    allowedRoles: ['ADMIN', 'MANAGER'],
    forbiddenRoles: ['STAFF'],
  },
  {
    name: 'Projects - Create',
    method: 'POST',
    url: '/api/v1/projects',
    allowedRoles: ['ADMIN', 'MANAGER'],
    forbiddenRoles: ['STAFF'],
  },
  {
    name: 'Invoices - Create',
    method: 'POST',
    url: '/api/v1/invoices',
    allowedRoles: ['ADMIN', 'MANAGER'],
    forbiddenRoles: ['STAFF'],
  },
  {
    name: 'Expenses - Create',
    method: 'POST',
    url: '/api/v1/expenses',
    allowedRoles: ['ADMIN', 'MANAGER'],
    forbiddenRoles: ['STAFF'],
  },
  {
    name: 'Reports - Finance',
    method: 'GET',
    url: '/api/v1/reports/finance',
    allowedRoles: ['ADMIN', 'MANAGER'],
    forbiddenRoles: ['STAFF'],
  },
  {
    name: 'Audit Logs - View',
    method: 'GET',
    url: '/api/v1/audit-logs',
    allowedRoles: ['ADMIN'],
    forbiddenRoles: ['MANAGER', 'STAFF'],
  },
];

export interface NavItem {
  path: string;
  label: string;
  roles: string[];
  category: string;
}

const ALL = ['ADMIN', 'MANAGER', 'STAFF'];
const ADMIN_MGR = ['ADMIN', 'MANAGER'];
const ADMIN_ONLY = ['ADMIN'];

export const navCategories = [
  'Core',
  'CRM & Client Pipeline',
  'Operations & Delivery',
  'Finance & Billing',
  'Administration',
] as const;

export const navConfig: NavItem[] = [
  { path: '/', label: 'Dashboard', roles: ALL, category: 'Core' },
  { path: '/clients', label: 'Clients', roles: ALL, category: 'CRM & Client Pipeline' },
  { path: '/leads', label: 'Leads', roles: ALL, category: 'CRM & Client Pipeline' },
  { path: '/follow-ups', label: 'Follow-ups', roles: ALL, category: 'CRM & Client Pipeline' },
  { path: '/quotations', label: 'Quotations', roles: ALL, category: 'CRM & Client Pipeline' },
  { path: '/projects', label: 'Projects', roles: ALL, category: 'Operations & Delivery' },
  { path: '/tasks', label: 'Tasks', roles: ALL, category: 'Operations & Delivery' },
  { path: '/admin/employees', label: 'Employees', roles: ADMIN_MGR, category: 'Operations & Delivery' },
  { path: '/invoices', label: 'Invoices', roles: ALL, category: 'Finance & Billing' },
  { path: '/expenses', label: 'Expenses', roles: ADMIN_MGR, category: 'Finance & Billing' },
  { path: '/reports/finance', label: 'Finance Reports', roles: ADMIN_MGR, category: 'Finance & Billing' },
  { path: '/reports/projects', label: 'Project Reports', roles: ADMIN_MGR, category: 'Finance & Billing' },
  { path: '/admin/users', label: 'Users', roles: ADMIN_ONLY, category: 'Administration' },
  { path: '/admin/audit', label: 'Audit Logs', roles: ADMIN_ONLY, category: 'Administration' },
];

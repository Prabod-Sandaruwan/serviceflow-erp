export interface NavItem {
  path: string;
  label: string;
  roles: string[];
}

const ALL = ['ADMIN', 'MANAGER', 'STAFF'];
const ADMIN_MGR = ['ADMIN', 'MANAGER'];
const ADMIN_ONLY = ['ADMIN'];

export const navConfig: NavItem[] = [
  { path: '/', label: 'Dashboard', roles: ALL },
  { path: '/clients', label: 'Clients', roles: ALL },
  { path: '/leads', label: 'Leads', roles: ALL },
  { path: '/follow-ups', label: 'Follow-ups', roles: ALL },
  { path: '/quotations', label: 'Quotations', roles: ALL },
  { path: '/projects', label: 'Projects', roles: ADMIN_MGR },
  { path: '/tasks', label: 'Tasks', roles: ALL },
  { path: '/invoices', label: 'Invoices', roles: ALL },
  { path: '/expenses', label: 'Expenses', roles: ADMIN_MGR },
  { path: '/reports/finance', label: 'Finance Reports', roles: ADMIN_MGR },
  { path: '/reports/projects', label: 'Project Reports', roles: ADMIN_MGR },
  { path: '/admin/employees', label: 'Employees', roles: ADMIN_MGR },
  { path: '/admin/users', label: 'Users', roles: ADMIN_ONLY },
  { path: '/admin/audit', label: 'Audit Logs', roles: ADMIN_ONLY },
];

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { RequireAuth, RequireRole } from './guards';
import { navConfig } from '../layouts/navConfig';

const Login = lazy(() => import('../features/auth/Login'));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const Profile = lazy(() => import('../features/profile/Profile'));
const ChangePassword = lazy(() => import('../features/profile/ChangePassword'));
const ClientList = lazy(() => import('../features/clients/ClientList'));
const ClientFormPage = lazy(() => import('../features/clients/ClientFormPage'));
const ClientDetailPage = lazy(() => import('../features/clients/ClientDetailPage'));
const LeadList = lazy(() => import('../features/leads/LeadList'));
const LeadFormPage = lazy(() => import('../features/leads/LeadFormPage'));
const LeadDetailPage = lazy(() => import('../features/leads/LeadDetailPage'));
const FollowUpList = lazy(() => import('../features/followUps/FollowUpList'));
const QuotationsPage = lazy(() => import('../features/quotations/QuotationsPage'));
const QuotationFormPage = lazy(() => import('../features/quotations/QuotationFormPage'));
const ProjectList = lazy(() => import('../features/projects/ProjectList'));
const TaskList = lazy(() => import('../features/tasks/TaskList'));
const InvoiceList = lazy(() => import('../features/invoices/InvoiceList'));
const ExpenseList = lazy(() => import('../features/expenses/ExpenseList'));
const FinanceReport = lazy(() => import('../features/reports/FinanceReport'));
const ProjectReport = lazy(() => import('../features/reports/ProjectReport'));
const UserList = lazy(() => import('../features/admin/UserList'));
const EmployeeList = lazy(() => import('../features/admin/EmployeeList'));
const AuditLogs = lazy(() => import('../features/admin/AuditLogs'));
const LogoutConfirm = lazy(() => import('../features/auth/LogoutConfirm'));
const NotFound = lazy(() => import('../components/NotFound'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
    <Component />
  </Suspense>
);

const getRoles = (path: string) =>
  navConfig.find((n) => n.path === path)?.roles || ['ADMIN', 'MANAGER', 'STAFF'];

const protectedChild = (path: string, Component: React.ComponentType, index = false) => ({
  ...(index ? { index: true } : { path: path.replace(/^\//, '') }),
  element: <RequireRole roles={getRoles(path)}>{withSuspense(Component)}</RequireRole>,
});

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(Login) },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      protectedChild('/', Dashboard, true),
      protectedChild('/logout', LogoutConfirm),
      protectedChild('/profile', Profile),
      { path: 'profile/password', element: <RequireAuth>{withSuspense(ChangePassword)}</RequireAuth> },
      protectedChild('/clients', ClientList),
      protectedChild('/clients/new', ClientFormPage),
      protectedChild('/clients/:id', ClientDetailPage),
      protectedChild('/clients/:id/edit', ClientFormPage),
      protectedChild('/leads', LeadList),
      protectedChild('/leads/new', LeadFormPage),
      protectedChild('/leads/:id', LeadDetailPage),
      protectedChild('/leads/:id/edit', LeadFormPage),
      protectedChild('/follow-ups', FollowUpList),
      protectedChild('/quotations', QuotationsPage),
      protectedChild('/quotations/new', QuotationFormPage),
      protectedChild('/quotations/:id/edit', QuotationFormPage),
      protectedChild('/projects', ProjectList),
      protectedChild('/tasks', TaskList),
      protectedChild('/invoices', InvoiceList),
      protectedChild('/expenses', ExpenseList),
      protectedChild('/reports/finance', FinanceReport),
      protectedChild('/reports/projects', ProjectReport),
      protectedChild('/admin/users', UserList),
      protectedChild('/admin/employees', EmployeeList),
      protectedChild('/admin/audit', AuditLogs),
    ],
  },
  { path: '*', element: withSuspense(NotFound) },
]);

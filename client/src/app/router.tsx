import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';

const Login = lazy(() => import('../features/auth/Login'));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const Profile = lazy(() => import('../features/profile/Profile'));
const ClientList = lazy(() => import('../features/clients/ClientList'));
const LeadList = lazy(() => import('../features/leads/LeadList'));
const FollowUpList = lazy(() => import('../features/followUps/FollowUpList'));
const QuotationList = lazy(() => import('../features/quotations/QuotationList'));
const ProjectList = lazy(() => import('../features/projects/ProjectList'));
const TaskList = lazy(() => import('../features/tasks/TaskList'));
const InvoiceList = lazy(() => import('../features/invoices/InvoiceList'));
const ExpenseList = lazy(() => import('../features/expenses/ExpenseList'));
const FinanceReport = lazy(() => import('../features/reports/FinanceReport'));
const ProjectReport = lazy(() => import('../features/reports/ProjectReport'));
const UserList = lazy(() => import('../features/admin/UserList'));
const EmployeeList = lazy(() => import('../features/admin/EmployeeList'));
const AuditLogs = lazy(() => import('../features/admin/AuditLogs'));
const NotFound = lazy(() => import('../components/NotFound'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(Login) },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(Dashboard) },
      { path: 'profile', element: withSuspense(Profile) },
      { path: 'clients', element: withSuspense(ClientList) },
      { path: 'leads', element: withSuspense(LeadList) },
      { path: 'follow-ups', element: withSuspense(FollowUpList) },
      { path: 'quotations', element: withSuspense(QuotationList) },
      { path: 'projects', element: withSuspense(ProjectList) },
      { path: 'tasks', element: withSuspense(TaskList) },
      { path: 'invoices', element: withSuspense(InvoiceList) },
      { path: 'expenses', element: withSuspense(ExpenseList) },
      { path: 'reports/finance', element: withSuspense(FinanceReport) },
      { path: 'reports/projects', element: withSuspense(ProjectReport) },
      { path: 'admin/users', element: withSuspense(UserList) },
      { path: 'admin/employees', element: withSuspense(EmployeeList) },
      { path: 'admin/audit', element: withSuspense(AuditLogs) },
    ],
  },
  { path: '*', element: withSuspense(NotFound) },
]);

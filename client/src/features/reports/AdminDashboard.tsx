import { KpiCard } from '../../components/ui/KpiCard';
import type { DashboardSummaryData } from './types';

export interface AdminDashboardProps {
  data?: DashboardSummaryData | null;
  isLoading?: boolean;
  isError?: boolean;
}

const fmt = (val?: string | number) =>
  val !== undefined && val !== null && val !== ''
    ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

export function AdminDashboard({ data, isLoading, isError }: AdminDashboardProps) {
  const c = data?.counts, f = data?.financials;
  const taskSub = c?.tasks ? `Overdue: ${c.tasks.overdue ?? 0} | In Progress: ${c.tasks.inProgress}` : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-slate-900">Financial Metrics</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard title="Revenue" value={fmt(f?.revenue)} subtitle="Issued invoice subtotals" isLoading={isLoading} isError={isError} />
          <KpiCard title="Payments Received" value={fmt(f?.paymentsReceived)} subtitle="Total cash collections" isLoading={isLoading} isError={isError} />
          <KpiCard title="Outstanding" value={fmt(f?.outstanding)} subtitle="Pending balance" isLoading={isLoading} isError={isError} />
          <KpiCard title="Overdue Outstanding" value={fmt(f?.overdueOutstanding)} subtitle="Past due invoice balance" isLoading={isLoading} isError={isError} />
          <KpiCard title="Expenses" value={fmt(f?.expenses)} subtitle="Active recorded expenses" isLoading={isLoading} isError={isError} />
          <KpiCard title="Estimated profit" value={fmt(f?.estimatedProfit)} subtitle="Revenue - Expenses" isLoading={isLoading} isError={isError} testId="kpi-estimated-profit" />
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">Operational Counts</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Active Clients" value={c?.activeClients ?? 0} isLoading={isLoading} isError={isError} />
          <KpiCard title="Active Projects" value={c?.activeProjects ?? 0} isLoading={isLoading} isError={isError} />
          <KpiCard title="Milestones" value={c?.milestones ?? 0} isLoading={isLoading} isError={isError} />
          <KpiCard title="Tasks" value={c?.tasks?.total ?? 0} subtitle={taskSub} isLoading={isLoading} isError={isError} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

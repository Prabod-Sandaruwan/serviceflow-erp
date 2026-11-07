import { KpiCard } from '../../components/ui/KpiCard';
import type { DashboardSummaryData } from './types';

export interface StaffDashboardProps {
  data?: DashboardSummaryData | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function StaffDashboard({ data, isLoading, isError }: StaffDashboardProps) {
  const tasks = data?.tasks;
  const taskSubtitle = tasks
    ? `Todo: ${tasks.todo} | In Progress: ${tasks.inProgress} | Done: ${tasks.done}`
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Work Summary</h2>
        <p className="text-xs text-slate-500">Overview of operational items assigned to or managed by you.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Tasks"
          value={tasks?.total ?? 0}
          subtitle={taskSubtitle}
          isLoading={isLoading}
          isError={isError}
          testId="kpi-staff-tasks"
        />

        <KpiCard
          title="Leads"
          value={data?.leadsCount ?? 0}
          subtitle="Assigned active leads"
          isLoading={isLoading}
          isError={isError}
          testId="kpi-staff-leads"
        />

        <KpiCard
          title="Quotations"
          value={data?.quotationsCount ?? 0}
          subtitle="Quotations prepared"
          isLoading={isLoading}
          isError={isError}
          testId="kpi-staff-quotations"
        />
      </div>
    </div>
  );
}

export default StaffDashboard;

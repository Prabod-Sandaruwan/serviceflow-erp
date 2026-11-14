import { ExecutiveKpis } from './ExecutiveKpis';
import { RevenueTrajectoryChart } from './RevenueTrajectoryChart';
import { InvoiceRiskDonut } from './InvoiceRiskDonut';
import { MarginTrajectoryChart } from './MarginTrajectoryChart';
import { ProjectDeliveryCard } from './ProjectDeliveryCard';
import type { DashboardSummaryData } from './types';

export interface AdminDashboardProps {
  data?: DashboardSummaryData | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function AdminDashboard({ data, isLoading, isError }: AdminDashboardProps) {
  const c = data?.counts;
  const f = data?.financials;

  return (
    <div className="space-y-6">
      {/* Top 5 KPI Cards */}
      <ExecutiveKpis f={f} isLoading={isLoading} isError={isError} />

      {/* Middle Row: Revenue Trajectory + Invoice Risk Donut */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueTrajectoryChart f={f} />
            </div>
            <div className="lg:col-span-1">
              <InvoiceRiskDonut f={f} />
            </div>
          </div>

          {/* Bottom Row: Margin Trajectory + Project Delivery */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MarginTrajectoryChart f={f} />
            <ProjectDeliveryCard c={c} />
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;

export interface TaskCounts {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue?: number;
}

export interface AdminCounts {
  activeClients: number;
  activeProjects: number;
  tasks: TaskCounts;
  milestones: number;
}

export interface DashboardFinancials {
  revenue: string;
  paymentsReceived: string;
  outstanding: string;
  overdueOutstanding: string;
  expenses: string;
  estimatedProfit: string;
  overdueCount?: number;
}

export interface TrajectoryMonth {
  m: string;
  inv: number;
  col: number;
  exp: number;
  invPct: number;
  colPct: number;
  expPct: number;
  isCurrent: boolean;
}

export interface FeaturedProjectData {
  id: string;
  code: string;
  name: string;
  budget: string;
  health: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';
  status: string;
  clientName: string;
  creatorName: string;
}

export interface DashboardSummaryData {
  role: string;
  counts?: AdminCounts;
  financials?: DashboardFinancials;
  tasks?: TaskCounts;
  leadsCount?: number;
  quotationsCount?: number;
  trajectories?: TrajectoryMonth[];
  featuredProject?: FeaturedProjectData | null;
}

export interface DashboardSummaryResponse {
  data: DashboardSummaryData;
}

export interface FinanceReportData {
  from: string;
  to: string;
  revenue: string;
  paymentsReceived: string;
  expenses: string;
  outstanding: string;
  estimatedProfitability: string;
  margin: string | null;
}

export interface FinanceReportResponse {
  data: FinanceReportData;
}

export interface ProjectFinancialItem {
  projectId: string;
  name?: string | null;
  projectCode?: string | null;
  revenue: string;
  billed: string;
  collected: string;
  expenses: string;
  estimatedProfitability: string;
  margin: string | null;
  progress: number;
}

export interface ProjectReportResponse {
  data: ProjectFinancialItem[];
}

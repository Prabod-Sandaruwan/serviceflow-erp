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
}

export interface DashboardSummaryData {
  role: string;
  counts?: AdminCounts;
  financials?: DashboardFinancials;
  tasks?: TaskCounts;
  leadsCount?: number;
  quotationsCount?: number;
}

export interface DashboardSummaryResponse {
  data: DashboardSummaryData;
}

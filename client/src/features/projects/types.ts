export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string | null;
  status: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | string;
  budgetAmount?: string;
  actualCost?: string;
  startDate?: string | null;
  endDate?: string | null;
  clientId: string;
  quotationId?: string | null;
  createdAt: string;
  updatedAt: string;
  progressPercent: number;
  client?: {
    id: string;
    displayName: string;
  };
  quotation?: {
    id: string;
    quotationNumber: string;
  };
}

export interface ProjectsResponse {
  data: Project[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages?: number;
  };
}

export interface CreateProjectInput {
  quotationId: string | number | bigint;
  name?: string;
  startDate?: string;
  endDate?: string;
}


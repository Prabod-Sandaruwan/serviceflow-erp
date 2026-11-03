export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  billingAmount: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'CANCELLED' | string;
  sortOrder?: number;
  eligibleForInvoice?: boolean;
}

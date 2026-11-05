export interface InvoiceItem {
  id: string;
  invoiceId: string;
  lineNo: number;
  description: string;
  quantity: string | number;
  unitPrice: string;
  lineAmount: string;
}

export interface InvoiceProject {
  id: string;
  name: string;
  projectCode: string;
  clientId?: string;
  client?: {
    id: string;
    displayName: string;
  };
}

export interface InvoicePayment {
  id: string;
  amount: string;
  paymentDate: string;
  reference?: string;
  status: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  milestoneId: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED' | string;
  issueDate?: string | null;
  dueDate?: string | null;
  subtotal: string;
  taxType?: string | null;
  taxRate?: string | null;
  taxAmount: string;
  taxReference?: string | null;
  total: string;
  paid: string;
  balance: string;
  isOverdue: boolean;
  notes?: string | null;
  createdBy: string;
  issuedBy?: string | null;
  issuedAt?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
  project?: InvoiceProject;
  payments?: InvoicePayment[];
}

export interface InvoicesResponse {
  data: Invoice[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

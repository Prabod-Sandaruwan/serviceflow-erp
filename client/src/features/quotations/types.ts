export interface QuotationItem {
  id?: string;
  quotationId?: string;
  lineNo: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName?: string | null;
  leadId?: string | null;
  revisionOfId?: string | null;
  title: string;
  status: string;
  isExpired?: boolean;
  quotationDate: string;
  validUntil: string;
  subtotal: number;
  taxType?: string | null;
  taxRate?: number | null;
  taxAmount: number;
  taxReference?: string | null;
  total: number;
  createdBy: string;
  creatorName?: string | null;
  submittedAt?: string | null;
  approvedBy?: string | null;
  approverName?: string | null;
  decidedAt?: string | null;
  rejectionReason?: string | null;
  sentAt?: string | null;
  respondedAt?: string | null;
  responseNote?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: QuotationItem[];
}

export interface QuotationsResponse {
  data: Quotation[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

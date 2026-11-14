export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'CONVERTED'
  | 'LOST'
  | 'WON';

export interface LeadOwner {
  id: string;
  email: string;
  fullName?: string | null;
}

export interface Lead {
  id: string;
  ownerId: string;
  owner?: LeadOwner | null;
  status: LeadStatus;
  lostReason?: string | null;
  expectedValue?: number | null;
  convertedClientId?: string | null;
  title?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadQuery {
  page?: number | string;
  limit?: number | string;
  status?: string;
  ownerId?: string;
  clientId?: string;
  search?: string;
  sort?: string;
}

export interface LeadsResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FollowUp {
  id: string;
  leadId: string;
  scheduledAt: string;
  status: 'PENDING' | 'DONE';
  notes?: string | null;
  isOverdue?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUpsResponse {
  data: FollowUp[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

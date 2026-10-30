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

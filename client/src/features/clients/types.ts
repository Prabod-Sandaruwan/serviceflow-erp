export interface Client {
  id: string;
  clientType: 'INDIVIDUAL' | 'BUSINESS' | 'COMPANY';
  displayName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  registrationNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  type?: string;
  isActive?: boolean | string;
  sort?: string;
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

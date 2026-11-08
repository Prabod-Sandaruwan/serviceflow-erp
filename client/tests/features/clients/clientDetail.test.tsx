import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ClientDetailPage from '../../../src/features/clients/ClientDetailPage';
import * as clientHooks from '../../../src/features/clients/hooks';

vi.mock('../../../src/features/clients/hooks', () => ({
  useClient: vi.fn(),
  useUpdateClient: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('../../../src/features/leads/hooks', () => ({
  useLeads: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
}));

vi.mock('../../../src/features/quotations/hooks', () => ({
  useQuotations: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
}));

vi.mock('../../../src/features/projects/hooks', () => ({
  useProjects: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
}));

describe('ClientDetailPage Component (CRM-006)', () => {
  const dummyClient = {
    id: 'client-99',
    displayName: 'Global Logistics',
    clientType: 'BUSINESS',
    email: 'info@globallogistics.lk',
    phone: '+94119998888',
    contactPerson: 'Perera',
    address: '123 Harbor Rd, Colombo',
    registrationNumber: 'PV9988',
    isActive: true,
  };

  it('renders client detail information, badges and opens inline edit modal', () => {
    vi.mocked(clientHooks.useClient).mockReturnValue({
      isLoading: false, isError: false, data: { data: dummyClient }, refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/clients/client-99']}>
        <Routes><Route path="/clients/:id" element={<ClientDetailPage />} /></Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Global Logistics' })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('info@globallogistics.lk')).toBeInTheDocument();
    expect(screen.getByText('+94119998888')).toBeInTheDocument();
    expect(screen.getByText('Perera')).toBeInTheDocument();
    expect(screen.getByText('123 Harbor Rd, Colombo')).toBeInTheDocument();

    const editBtn = screen.getByRole('button', { name: /Edit Details|Edit Client/i });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);
    expect(screen.getByRole('heading', { name: /Edit Client Details/i })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quotations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ClientDetailPage from '../../../src/features/clients/ClientDetailPage';
import * as clientHooks from '../../../src/features/clients/hooks';

vi.mock('../../../src/features/clients/hooks', () => ({
  useClient: vi.fn(),
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

  it('renders client detail information, badges and placeholder tabs', () => {
    vi.mocked(clientHooks.useClient).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: dummyClient },
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/clients/client-99']}>
        <Routes>
          <Route path="/clients/:id" element={<ClientDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Global Logistics' })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('info@globallogistics.lk')).toBeInTheDocument();
    expect(screen.getByText('+94119998888')).toBeInTheDocument();
    expect(screen.getByText('Perera')).toBeInTheDocument();
    expect(screen.getByText('123 Harbor Rd, Colombo')).toBeInTheDocument();

    const editBtn = screen.getByRole('button', { name: /Edit Client/i });
    expect(editBtn).toBeInTheDocument();
    expect(editBtn.closest('a')).toHaveAttribute('href', '/clients/client-99/edit');

    expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quotations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  });
});


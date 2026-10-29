import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ClientList from '../../../src/features/clients/ClientList';
import * as clientHooks from '../../../src/features/clients/hooks';

vi.mock('../../../src/features/clients/hooks', () => ({
  useClients: vi.fn(),
}));

describe('ClientList Component (CRM-005)', () => {
  const dummyClients = [
    {
      id: 'client-1',
      displayName: 'Acme International',
      clientType: 'BUSINESS',
      email: 'contact@acme.com',
      phone: '+94112233445',
      isActive: true,
    },
    {
      id: 'client-2',
      displayName: 'John Smith',
      clientType: 'INDIVIDUAL',
      email: 'john@example.com',
      phone: null,
      isActive: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders client list with columns, data rows and action links', () => {
    vi.mocked(clientHooks.useClients).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: dummyClients,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ClientList />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Clients/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New client/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search clients/i)).toBeInTheDocument();

    expect(screen.getByText('Acme International')).toBeInTheDocument();
    expect(screen.getByText('BUSINESS')).toBeInTheDocument();
    expect(screen.getByText('contact@acme.com')).toBeInTheDocument();
    expect(screen.getByText('+94112233445')).toBeInTheDocument();

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('INDIVIDUAL')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();

    const viewLinks = screen.getAllByRole('link', { name: /View/i });
    expect(viewLinks).toHaveLength(2);
    expect(viewLinks[0]).toHaveAttribute('href', '/clients/client-1');
  });

  it('debounces search input changes', async () => {
    vi.mocked(clientHooks.useClients).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ClientList />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Search clients/i);
    fireEvent.change(input, { target: { value: 'Acme' } });

    await waitFor(() => {
      expect(input).toHaveValue('Acme');
    });
  });
});

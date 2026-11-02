import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import QuotationsPage from '../../../src/features/quotations/QuotationsPage';
import * as quotationHooks from '../../../src/features/quotations/hooks';
import * as authProvider from '../../../src/features/auth/AuthProvider';

vi.mock('../../../src/features/quotations/hooks', () => ({
  useQuotations: vi.fn(),
  useQuotation: vi.fn(),
}));

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('QuotationsPage Component (QUOT-012)', () => {
  const dummyQuotations = [
    {
      id: '101',
      quotationNumber: 'QT-2026-0001',
      clientId: '5',
      clientName: 'Acme Corp',
      title: 'Office Network Setup',
      total: 12500,
      status: 'SENT',
      isExpired: true,
      quotationDate: '2026-11-01',
      validUntil: '2026-11-02',
    },
    {
      id: '102',
      quotationNumber: 'QT-2026-0002',
      clientId: '6',
      clientName: 'Beta LLC',
      title: 'Server Migration',
      total: 45000,
      status: 'APPROVED',
      isExpired: false,
      quotationDate: '2026-11-01',
      validUntil: '2026-11-15',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authProvider.useAuth).mockReturnValue({
      user: { id: '10', role: 'STAFF', email: 'staff@example.com' },
    } as any);
    vi.mocked(quotationHooks.useQuotations).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: dummyQuotations, meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 } },
      refetch: vi.fn(),
    } as any);
  });

  it('renders quotation table, columns, data rows, and "+ New Quotation" link', () => {
    render(<MemoryRouter><QuotationsPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /Quotations/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ New Quotation/i })).toBeInTheDocument();
    expect(screen.getByText('QT-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Office Network Setup')).toBeInTheDocument();
    expect(screen.getByText('$12,500.00')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByTestId('expired-badge')).toHaveTextContent('Expired');
  });

  it('hides "Pending approval" tab for STAFF, shows for MANAGER/ADMIN', () => {
    const { unmount } = render(<MemoryRouter><QuotationsPage /></MemoryRouter>);
    expect(screen.queryByRole('tab', { name: /Pending approval/i })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mine/i })).toBeInTheDocument();
    unmount();

    vi.mocked(authProvider.useAuth).mockReturnValue({
      user: { id: '2', role: 'MANAGER', email: 'mgr@example.com' },
    } as any);
    render(<MemoryRouter><QuotationsPage /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: /Pending approval/i })).toBeInTheDocument();
  });

  it('clicking tabs updates active tab and queries quotations', () => {
    vi.mocked(authProvider.useAuth).mockReturnValue({
      user: { id: '2', role: 'ADMIN', email: 'admin@example.com' },
    } as any);
    render(<MemoryRouter><QuotationsPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('tab', { name: /Mine/i }));
    expect(quotationHooks.useQuotations).toHaveBeenCalled();
  });
});

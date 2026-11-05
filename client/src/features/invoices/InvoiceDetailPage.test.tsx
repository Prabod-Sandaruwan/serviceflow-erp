import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvoiceDetailPage from './InvoiceDetailPage';
import * as invoiceHooks from './hooks';
import * as authProvider from '../auth/AuthProvider';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('./hooks', () => ({
  useInvoice: vi.fn(),
  downloadInvoicePdf: vi.fn(),
  useIssueInvoice: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelInvoice: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('InvoiceDetailPage Component (INV-014)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const renderPage = (invData: any, role = 'MANAGER') => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    vi.mocked(invoiceHooks.useInvoice).mockReturnValue({
      data: { data: invData }, isLoading: false, isError: false, refetch: vi.fn(),
    } as any);

    return render(
      <ToastProvider>
        <MemoryRouter initialEntries={[`/invoices/${invData.id}`]}>
          <Routes>
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );
  };

  const baseInv = {
    id: 'inv-1', invoiceNumber: 'INV-2026-0001', milestoneId: 'm-1', clientId: 'c-1',
    projectId: 'p-1', status: 'DRAFT', subtotal: '1000.00', taxAmount: '0.00',
    total: '1000.00', balance: '1000.00', isOverdue: false, items: [], payments: [],
  };

  it('Test 1 (Role/Status Matrix - DRAFT): MANAGER sees Edit, Issue, and Cancel', () => {
    renderPage({ ...baseInv, status: 'DRAFT' }, 'MANAGER');
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Issue$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('Test 2 (Role/Status Matrix - ISSUED): MANAGER sees only Cancel (Edit & Issue hidden)', () => {
    renderPage({ ...baseInv, status: 'ISSUED' }, 'MANAGER');
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Issue$/i })).not.toBeInTheDocument();
  });

  it('Test 3 (Role/Status Matrix - STAFF): STAFF sees no mutation actions for DRAFT or ISSUED', () => {
    const { unmount } = renderPage({ ...baseInv, status: 'DRAFT' }, 'STAFF');
    expect(screen.queryByRole('button', { name: /Create/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Issue$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
    unmount();

    renderPage({ ...baseInv, status: 'ISSUED' }, 'STAFF');
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Issue$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
  });

  it('Test 4 (Overdue Badge): renders Overdue badge when isOverdue is true', () => {
    const { unmount } = renderPage({ ...baseInv, isOverdue: true });
    expect(screen.getByTestId('overdue-badge')).toHaveTextContent('Overdue');
    unmount();

    renderPage({ ...baseInv, isOverdue: false });
    expect(screen.queryByTestId('overdue-badge')).not.toBeInTheDocument();
  });
});

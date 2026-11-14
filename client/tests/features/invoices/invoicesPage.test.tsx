import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InvoicesPage from '../../../src/features/invoices/InvoicesPage';
import * as invoiceHooks from '../../../src/features/invoices/hooks';
import * as exportInvoices from '../../../src/features/invoices/exportInvoices';

vi.mock('../../../src/features/invoices/hooks', () => ({
  useInvoices: vi.fn(),
  useIssueInvoice: vi.fn(),
  downloadInvoicePdf: vi.fn(),
}));

vi.mock('../../../src/features/invoices/exportInvoices', () => ({
  downloadAllInvoicesCsv: vi.fn(),
}));

const mockInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0006',
    projectId: 'p1',
    project: { name: 'my test quotation', client: { displayName: 'student' } },
    issueDate: '2026-11-05',
    dueDate: '2026-11-30',
    total: '6666.00',
    balance: '0.00',
    paid: '6666.00',
    status: 'PAID',
    isOverdue: false,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0002',
    projectId: 'p1',
    project: { name: 'my test quotation', client: { displayName: 'student' } },
    issueDate: '2026-10-05',
    dueDate: '2026-10-25',
    total: '110000.00',
    balance: '106200.00',
    paid: '3800.00',
    status: 'ISSUED',
    isOverdue: true,
  },
];

describe('InvoicesPage Redesign & Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoiceHooks.useIssueInvoice).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
  });

  const renderComponent = () => {
    vi.mocked(invoiceHooks.useInvoices).mockReturnValue({
      data: { data: mockInvoices, meta: { total: 2, page: 1, totalPages: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const client = new QueryClient();
    return render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders summary metric cards, filter controls, and invoice rows with overdue badges', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /^Invoices$/i })).toBeInTheDocument();
    expect(screen.getByText('TOTAL INVOICED')).toBeInTheDocument();
    expect(screen.getByText('TOTAL COLLECTED')).toBeInTheDocument();
    expect(screen.getByText('OUTSTANDING BALANCE')).toBeInTheDocument();
    expect(screen.getByText('OVERDUE ACCOUNTS')).toBeInTheDocument();

    expect(screen.getByText('INV-2026-0006')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-0002')).toBeInTheDocument();
    expect(screen.getAllByText('my test quotation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('student').length).toBeGreaterThan(0);

    expect(screen.getByTestId('overdue-badge')).toHaveTextContent('Overdue');

    const exportBtn = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportBtn);
    expect(exportInvoices.downloadAllInvoicesCsv).toHaveBeenCalledWith(mockInvoices);

    expect(screen.getByRole('link', { name: /\+ Create Invoice/i })).toHaveAttribute('href', '/invoices/new');
  });
});


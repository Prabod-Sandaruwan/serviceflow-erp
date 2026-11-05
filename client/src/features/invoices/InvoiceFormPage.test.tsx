import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvoiceFormPage from './InvoiceFormPage';
import * as invoiceHooks from './hooks';
import * as milestoneHooks from '../milestones/hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./hooks', () => ({
  useInvoice: vi.fn(),
  useCreateInvoice: vi.fn(),
  useUpdateInvoice: vi.fn(),
}));
vi.mock('../milestones/hooks', () => ({ useMilestone: vi.fn() }));

describe('InvoiceFormPage Component (INV-014)', () => {
  const mockCreate = vi.fn(), mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoiceHooks.useCreateInvoice).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(invoiceHooks.useUpdateInvoice).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderComponent = (path: string) => render(
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/invoices/new" element={<InvoiceFormPage />} />
          <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );

  it('Test 1 (Subtotal Warning): renders mismatch warning when subtotal differs from billingAmount', async () => {
    vi.mocked(invoiceHooks.useInvoice).mockReturnValue({ data: undefined } as any);
    vi.mocked(milestoneHooks.useMilestone).mockReturnValue({
      data: { data: { id: 'm-1', title: 'Initial Milestone', billingAmount: '1000.00' } },
    } as any);

    renderComponent('/invoices/new?milestoneId=m-1');
    const amtInput = await screen.findByPlaceholderText('Amount');
    expect(amtInput).toHaveValue(1000);
    expect(screen.queryByTestId('amount-mismatch-warning')).not.toBeInTheDocument();

    fireEvent.change(amtInput, { target: { value: '800.00' } });
    expect(await screen.findByTestId('amount-mismatch-warning')).toBeInTheDocument();
    expect(screen.getByText(/Warning: Items subtotal \(\$800\.00\) does not match milestone billing amount \(\$1000\.00\)\./i)).toBeInTheDocument();
  });

  it('Test 2 (Read-only State): disables all input fields for non-DRAFT (ISSUED) invoice', async () => {
    vi.mocked(invoiceHooks.useInvoice).mockReturnValue({
      data: {
        data: {
          id: 'inv-1', invoiceNumber: 'INV-2026-0001', status: 'ISSUED', taxType: 'VAT',
          taxAmount: '50.00', taxReference: 'TAX-1', dueDate: '2026-12-01',
          items: [{ description: 'Dev Work', lineAmount: '1000.00' }],
        },
      },
    } as any);
    vi.mocked(milestoneHooks.useMilestone).mockReturnValue({ data: undefined } as any);

    renderComponent('/invoices/inv-1/edit');
    expect(await screen.findByText(/This invoice is ISSUED and cannot be modified\./i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeDisabled();
    expect(screen.getByPlaceholderText('Amount')).toBeDisabled();
    expect(screen.getByLabelText(/Tax Type/i)).toBeDisabled();
    expect(screen.getByLabelText(/Tax Amount/i)).toBeDisabled();
    expect(screen.getByLabelText(/Tax Reference/i)).toBeDisabled();
    expect(screen.getByLabelText(/Due Date/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled();
  });

  it('Test 3 (409 Handling): displays toast error on 409 INVOICE_IMMUTABLE conflict', async () => {
    vi.mocked(invoiceHooks.useInvoice).mockReturnValue({
      data: { data: { id: 'inv-2', status: 'DRAFT', items: [{ description: 'Item 1', lineAmount: '100.00' }] } },
    } as any);
    vi.mocked(milestoneHooks.useMilestone).mockReturnValue({ data: undefined } as any);
    mockUpdate.mockRejectedValueOnce({ status: 409, message: 'INVOICE_IMMUTABLE: Invoice is not editable' });

    renderComponent('/invoices/inv-2/edit');
    fireEvent.click(await screen.findByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText(/INVOICE_IMMUTABLE: Invoice is not editable/i)).toBeInTheDocument();
  });
});

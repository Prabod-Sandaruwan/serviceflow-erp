import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvoiceFormPage from '../../../src/features/invoices/InvoiceFormPage';
import * as invoiceHooks from '../../../src/features/invoices/hooks';
import * as milestoneHooks from '../../../src/features/milestones/hooks';
import * as projectHooks from '../../../src/features/projects/hooks';
import { ToastProvider } from '../../../src/components/ui/Toast';

vi.mock('../../../src/features/invoices/hooks', () => ({
  useInvoice: vi.fn(),
  useCreateInvoice: vi.fn(),
  useUpdateInvoice: vi.fn(),
}));
vi.mock('../../../src/features/milestones/hooks', () => ({
  useMilestone: vi.fn(),
  useMilestones: vi.fn(),
}));
vi.mock('../../../src/features/projects/hooks', () => ({
  useProjects: vi.fn(),
}));

describe('Invoice Creation with Project & Milestone Picker', () => {
  const mockCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoiceHooks.useInvoice).mockReturnValue({ data: undefined } as any);
    vi.mocked(invoiceHooks.useUpdateInvoice).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(invoiceHooks.useCreateInvoice).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(milestoneHooks.useMilestone).mockReturnValue({ data: undefined } as any);
    vi.mocked(projectHooks.useProjects).mockReturnValue({
      data: { data: [{ id: 'p-1', projectCode: 'PRJ-001', name: 'ERP System' }] },
      isLoading: false,
    } as any);
    vi.mocked(milestoneHooks.useMilestones).mockReturnValue({
      data: {
        data: [
          { id: 'm-1', title: 'Phase 1 Delivery', billingAmount: '5000.00', status: 'APPROVED' },
          { id: 'm-2', title: 'Phase 2 Design', billingAmount: '3000.00', status: 'PENDING' },
        ],
      },
      isLoading: false,
    } as any);
  });

  const renderComponent = () => render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/invoices/new']}>
        <Routes>
          <Route path="/invoices/new" element={<InvoiceFormPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );

  it('renders picker, selects approved milestone and submits successfully', async () => {
    mockCreate.mockResolvedValueOnce({ data: { id: 'inv-100' } });
    renderComponent();

    expect(await screen.findByText(/Select Project & Approved Milestone/i)).toBeInTheDocument();
    const projSelect = screen.getByLabelText(/^Project$/i);
    fireEvent.change(projSelect, { target: { value: 'p-1' } });

    const msSelect = screen.getByLabelText(/^Milestone$/i);
    fireEvent.change(msSelect, { target: { value: 'm-1' } });

    await waitFor(() => {
      const descInput = screen.getByPlaceholderText('Description') as HTMLInputElement;
      expect(descInput.value).toBe('Phase 1 Delivery');
    });

    const submitBtn = screen.getByRole('button', { name: /Create Draft Invoice/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        milestoneId: 'm-1',
        items: [{ description: 'Phase 1 Delivery', amount: '5000.00' }],
      }));
    });
  });

  it('shows error if submitted without selecting a milestone', async () => {
    renderComponent();
    const descInput = await screen.findByPlaceholderText('Description');
    fireEvent.change(descInput, { target: { value: 'Some work' } });
    const submitBtn = screen.getByRole('button', { name: /Create Draft Invoice/i });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/Please select an approved milestone to create an invoice/i)).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

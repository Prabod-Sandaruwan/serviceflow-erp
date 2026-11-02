import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import QuotationFormPage from './QuotationFormPage';
import * as quotationHooks from './hooks';
import * as clientHooks from '../clients/hooks';
import { ApiError } from '../../lib/ApiError';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../clients/hooks', () => ({ useClients: vi.fn() }));
vi.mock('./hooks', () => ({ useQuotation: vi.fn(), useCreateQuotation: vi.fn(), useUpdateQuotation: vi.fn() }));

describe('QuotationFormPage Component (QUOT-013)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clientHooks.useClients).mockReturnValue({ isLoading: false, data: { data: [{ id: '10', displayName: 'Apex Holdings', clientType: 'BUSINESS' }] } } as any);
    vi.mocked(quotationHooks.useQuotation).mockReturnValue({ isLoading: false, data: undefined } as any);
    vi.mocked(quotationHooks.useCreateQuotation).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(quotationHooks.useUpdateQuotation).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderComponent = (path = '/quotations/new') =>
    render(<ToastProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/quotations/new" element={<QuotationFormPage />} /><Route path="/quotations/:id/edit" element={<QuotationFormPage />} /></Routes></MemoryRouter></ToastProvider>);

  it('Test 1: Add and remove item rows successfully', async () => {
    renderComponent();
    expect(screen.getAllByTestId('item-row')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Item/i }));
    expect(screen.getAllByTestId('item-row')).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: /Remove/i })[1]);
    expect(screen.getAllByTestId('item-row')).toHaveLength(1);
  });

  it('Test 2: Validation prevents submission if 0 items or quantity <= 0', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Select Client/i), { target: { value: '10' } });
    expect(screen.getByPlaceholderText('Client ID')).toHaveValue('10');
    fireEvent.change(screen.getByPlaceholderText(/Website Revamp/i), { target: { value: 'Revamp' } });
    fireEvent.change(screen.getByLabelText(/Valid Until/i), { target: { value: '2026-12-01' } });

    // Quantity <= 0 check
    fireEvent.change(screen.getByPlaceholderText('Qty'), { target: { value: '0' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Service' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Quotation/i }));
    expect(await screen.findByText(/Quantity must be greater than 0/i)).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();

    // Unit price < 0 check
    fireEvent.change(screen.getByPlaceholderText('Qty'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Unit Price'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Quotation/i }));
    expect(await screen.findByText(/Unit price cannot be negative/i)).toBeInTheDocument();

    // 0 items check
    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
    expect(screen.queryByTestId('item-row')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Create Quotation/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Quotation must have at least one item/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('Test 3: Server error mapping works (mock a 422 response and assert field errors)', async () => {
    const error422 = new ApiError(422, 'VALIDATION_ERROR', 'Validation error', [
      { field: 'title', issue: 'Quotation title is duplicate' },
    ]);
    mockCreate.mockRejectedValueOnce(error422);
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Client ID'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/Website Revamp/i), { target: { value: 'Dup Title' } });
    fireEvent.change(screen.getByLabelText(/Valid Until/i), { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Consulting' } });
    fireEvent.change(screen.getByPlaceholderText('Qty'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Unit Price'), { target: { value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Quotation/i }));
    expect(await screen.findByText('Quotation title is duplicate')).toBeInTheDocument();
  });

  it('Test 4: Disables all inputs if quotation is not in DRAFT status', () => {
    vi.mocked(quotationHooks.useQuotation).mockReturnValue({
      isLoading: false,
      data: { data: { id: '100', status: 'PENDING_APPROVAL', title: 'Locked Quote', clientId: '10', validUntil: '2026-12-01', items: [{ description: 'Item 1', quantity: 1, unitPrice: 100 }] } },
    } as any);
    renderComponent('/quotations/100/edit');
    expect(screen.getByRole('alert')).toHaveTextContent(/is locked/i);
    expect(screen.getByPlaceholderText(/Website Revamp/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled();
  });
});

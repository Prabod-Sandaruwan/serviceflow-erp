import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConvertDialog from './ConvertDialog';
import * as leadHooks from './hooks';
import * as clientHooks from '../clients/hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./hooks', () => ({
  useConvertLead: vi.fn(),
}));

vi.mock('../clients/hooks', () => ({
  useClients: vi.fn(),
}));

describe('ConvertDialog Component (CRM-013)', () => {
  const mockConvert = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leadHooks.useConvertLead).mockReturnValue({ mutateAsync: mockConvert, isPending: false } as any);
    vi.mocked(clientHooks.useClients).mockReturnValue({
      data: { data: [{ id: 'c-1', displayName: 'Acme Corp', clientType: 'BUSINESS' }] },
    } as any);
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <ConvertDialog leadId="lead-1" isOpen={true} onClose={mockOnClose} />
      </ToastProvider>,
    );

  it('Test 1 (Valid): select existing client and convert calls API successfully', async () => {
    mockConvert.mockResolvedValueOnce({ data: { clientId: 'c-1' } });
    renderComponent();

    fireEvent.click(screen.getByLabelText(/Link existing client/i));
    fireEvent.change(screen.getByLabelText(/Select Existing Client/i), { target: { value: 'c-1' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Conversion/i }));

    await waitFor(() => {
      expect(mockConvert).toHaveBeenCalledWith({ existingClientId: 'c-1' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('Test 2 (409 Conflict): 409 rejection displays info toast and closes dialog', async () => {
    mockConvert.mockRejectedValueOnce({ status: 409, message: 'LEAD_ALREADY_CONVERTED' });
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Conversion/i }));

    await waitFor(() => {
      expect(mockConvert).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/Notice: Lead is already converted\./i);
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LeadFormPage from './LeadFormPage';
import * as leadHooks from './hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./hooks', () => ({
  useLead: vi.fn(),
  useCreateLead: vi.fn(),
  useUpdateLead: vi.fn(),
}));

describe('LeadFormPage Component (CRM-013)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leadHooks.useLead).mockReturnValue({ isLoading: false, data: undefined } as any);
    vi.mocked(leadHooks.useCreateLead).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(leadHooks.useUpdateLead).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderComponent = (path = '/leads/new') =>
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/leads/new" element={<LeadFormPage />} />
            <Route path="/leads/:id/edit" element={<LeadFormPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>,
    );

  it('Test 1 (Invalid - Status Rule): selecting LOST without lostReason displays validation error', async () => {
    vi.mocked(leadHooks.useLead).mockReturnValue({
      isLoading: false,
      data: { data: { id: '1', title: 'Solar Deal', status: 'NEW', expectedValue: 5000 } },
    } as any);

    renderComponent('/leads/1/edit');
    const statusSelect = await screen.findByLabelText(/Pipeline Status/i);
    fireEvent.change(statusSelect, { target: { value: 'LOST' } });

    expect(await screen.findByLabelText(/Lost Reason/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Lost reason is required when status is LOST/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('Test 2 (Valid): fill form with NEW status calls API successfully', async () => {
    mockCreate.mockResolvedValueOnce({ data: { id: 'lead-100' } });
    renderComponent('/leads/new');

    fireEvent.change(screen.getByLabelText(/Lead Title/i), { target: { value: 'Alpha Project' } });
    fireEvent.change(screen.getByLabelText(/Estimated Value/i), { target: { value: '25000' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Lead/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'NEW', expectedValue: 25000 }),
      );
    });
  });
});

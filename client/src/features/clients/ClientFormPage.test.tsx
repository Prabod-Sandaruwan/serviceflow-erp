import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ClientFormPage from './ClientFormPage';
import * as clientHooks from './hooks';
import { ApiError } from '../../lib/ApiError';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./hooks', () => ({
  useClient: vi.fn(),
  useCreateClient: vi.fn(),
  useUpdateClient: vi.fn(),
}));

describe('ClientFormPage Component (CRM-013)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clientHooks.useClient).mockReturnValue({ isLoading: false, data: undefined } as any);
    vi.mocked(clientHooks.useCreateClient).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(clientHooks.useUpdateClient).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderComponent = (path = '/clients/new') =>
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/clients/new" element={<ClientFormPage />} />
            <Route path="/clients/:id/edit" element={<ClientFormPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>,
    );

  it('Test 1 (Invalid): submit empty form displays Zod validation errors', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Display name is required/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('Test 2 (Valid): fill valid data calls create mutation successfully', async () => {
    mockCreate.mockResolvedValueOnce({ data: { id: 'c-100', displayName: 'Apex Holdings' } });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Client \/ Company Name/i), { target: { value: 'Apex Holdings' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'contact@apex.lk' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Apex Holdings', email: 'contact@apex.lk' }),
      );
    });
  });

  it('Test 3 (Server Error): 422 with field error renders field error via applyApiErrors', async () => {
    const error422 = new ApiError(422, 'VALIDATION_ERROR', 'Validation error', [
      { field: 'displayName', issue: 'Client name already taken' },
    ]);
    mockCreate.mockRejectedValueOnce(error422);
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Client \/ Company Name/i), { target: { value: 'Existing Corp' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    expect(await screen.findByText('Client name already taken')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ClientFormPage from '../../../src/features/clients/ClientFormPage';
import * as clientHooks from '../../../src/features/clients/hooks';

vi.mock('../../../src/features/clients/hooks', () => ({
  useClient: vi.fn(), useCreateClient: vi.fn(), useUpdateClient: vi.fn(),
}));

describe('ClientFormPage Component (CRM-006)', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clientHooks.useClient).mockReturnValue({ isLoading: false, isError: false, data: undefined } as any);
    vi.mocked(clientHooks.useCreateClient).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false } as any);
    vi.mocked(clientHooks.useUpdateClient).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false } as any);
  });

  const renderForm = () => render(
    <MemoryRouter initialEntries={['/clients/new']}>
      <Routes><Route path="/clients/new" element={<ClientFormPage />} /></Routes>
    </MemoryRouter>
  );

  it('renders new client form with all fields and submits', async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: { id: 'client-1', displayName: 'Nova Tech' }, duplicateWarning: false });
    renderForm();

    expect(screen.getByRole('heading', { name: /New Client/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Client \/ Company Name/i), { target: { value: 'Nova Tech' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'nova@tech.lk' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'Nova Tech', email: 'nova@tech.lk' }));
    });
  });

  it('displays warning banner when duplicate email/registration is returned', async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: { id: 'client-2', displayName: 'Apex Ltd' }, duplicateWarning: true });
    renderForm();

    fireEvent.change(screen.getByLabelText(/Client \/ Company Name/i), { target: { value: 'Apex Ltd' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  });

  it('displays error alert on server failure (e.g. 403 or 422)', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Not authorized to edit this client'));
    renderForm();

    fireEvent.change(screen.getByLabelText(/Client \/ Company Name/i), { target: { value: 'Blocked Client' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Not authorized to edit this client/i));
  });
});

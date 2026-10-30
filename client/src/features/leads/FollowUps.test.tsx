import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FollowUps from './FollowUps';
import * as leadHooks from './hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./hooks', () => ({
  useFollowUps: vi.fn(),
  useCreateFollowUp: vi.fn(),
  useUpdateFollowUp: vi.fn(),
}));

describe('FollowUps Component (CRM-013)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leadHooks.useFollowUps).mockReturnValue({
      isLoading: false,
      data: { data: [] },
    } as any);
    vi.mocked(leadHooks.useCreateFollowUp).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(leadHooks.useUpdateFollowUp).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <FollowUps leadId="lead-1" />
      </ToastProvider>,
    );

  it('Test 1 (Invalid): past date follow-up renders validation error alert and toast', async () => {
    mockCreate.mockRejectedValueOnce({
      status: 422,
      details: [{ issue: 'A PENDING follow-up cannot be scheduled before today' }],
    });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Schedule Date & Time/i), { target: { value: '2020-01-01T10:00' } });
    fireEvent.click(screen.getByRole('button', { name: /\+ Schedule/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/cannot be scheduled before today/i);
    expect(screen.getByRole('status')).toHaveTextContent(/cannot be scheduled before today/i);
  });

  it('Test 2 (Valid): create valid follow-up calls mutation and resets form', async () => {
    mockCreate.mockResolvedValueOnce({ data: { id: 'f-1' } });
    renderComponent();

    const dateInput = screen.getByLabelText(/Schedule Date & Time/i);
    const notesInput = screen.getByPlaceholderText(/Call \/ meeting notes.../i);

    fireEvent.change(dateInput, { target: { value: '2026-11-20T14:30' } });
    fireEvent.change(notesInput, { target: { value: 'Discuss proposal' } });
    fireEvent.click(screen.getByRole('button', { name: /\+ Schedule/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ leadId: 'lead-1', notes: 'Discuss proposal' }),
      );
    });
    expect(dateInput).toHaveValue('');
    expect(notesInput).toHaveValue('');
  });
});

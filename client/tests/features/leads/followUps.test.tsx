import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FollowUps from '../../../src/features/leads/FollowUps';
import ConvertDialog from '../../../src/features/leads/ConvertDialog';
import * as leadHooks from '../../../src/features/leads/hooks';
import * as clientHooks from '../../../src/features/clients/hooks';

vi.mock('../../../src/features/leads/hooks', () => ({
  useFollowUps: vi.fn(),
  useCreateFollowUp: vi.fn(),
  useUpdateFollowUp: vi.fn(),
  useConvertLead: vi.fn(),
}));

vi.mock('../../../src/features/clients/hooks', () => ({
  useClients: vi.fn(),
}));

describe('FollowUps & ConvertDialog Components (CRM-012)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockConvert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leadHooks.useCreateFollowUp).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(leadHooks.useUpdateFollowUp).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
    vi.mocked(leadHooks.useConvertLead).mockReturnValue({ mutateAsync: mockConvert, isPending: false } as any);
    vi.mocked(clientHooks.useClients).mockReturnValue({ data: { data: [{ id: 'c-1', displayName: 'Apex Ltd', clientType: 'BUSINESS' }] } } as any);
  });

  it('FollowUps: renders list with overdue badge and triggers mark done', async () => {
    vi.mocked(leadHooks.useFollowUps).mockReturnValue({
      isLoading: false,
      data: {
        data: [
          { id: 'f-1', leadId: '10', scheduledAt: '2026-10-01T10:00:00Z', status: 'PENDING', isOverdue: true, notes: 'Follow up contract' },
          { id: 'f-2', leadId: '10', scheduledAt: '2026-11-01T10:00:00Z', status: 'DONE', isOverdue: false, notes: 'Intro done' },
        ],
      },
    } as any);

    render(<FollowUps leadId="10" />);
    expect(screen.getByText('Follow-ups & Activities')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Follow up contract')).toBeInTheDocument();

    const markDoneBtn = screen.getByRole('button', { name: /Mark Done/i });
    fireEvent.click(markDoneBtn);
    expect(mockUpdate).toHaveBeenCalledWith({ id: 'f-1', status: 'DONE' });
  });

  it('ConvertDialog: handles 409 gracefully and closes dialog', async () => {
    mockConvert.mockRejectedValueOnce({ status: 409, message: 'Lead already converted' });
    const onClose = vi.fn();

    render(<ConvertDialog leadId="10" isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Confirm Conversion/i }));

    await waitFor(() => {
      expect(mockConvert).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});

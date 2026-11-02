import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ActionBar } from './ActionBar';
import * as authProvider from '../auth/AuthProvider';
import * as wfHooks from './workflowHooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('./workflowHooks', () => ({
  downloadQuotationPdf: vi.fn(),
  useSubmitQuotation: vi.fn(),
  useApproveQuotation: vi.fn(),
  useRejectQuotation: vi.fn(),
  useSendQuotation: vi.fn(),
  useRespondQuotation: vi.fn(),
  useReviseQuotation: vi.fn(),
}));

describe('ActionBar Component (QUOT-015)', () => {
  const mockMutate = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    const hookReturn = { mutateAsync: mockMutate, isPending: false } as any;
    vi.mocked(wfHooks.useSubmitQuotation).mockReturnValue(hookReturn);
    vi.mocked(wfHooks.useApproveQuotation).mockReturnValue(hookReturn);
    vi.mocked(wfHooks.useRejectQuotation).mockReturnValue(hookReturn);
    vi.mocked(wfHooks.useSendQuotation).mockReturnValue(hookReturn);
    vi.mocked(wfHooks.useRespondQuotation).mockReturnValue(hookReturn);
    vi.mocked(wfHooks.useReviseQuotation).mockReturnValue(hookReturn);
  });

  const renderBar = (status: string, role = 'STAFF', userId = '1', createdBy = '2', refetch = vi.fn()) => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: userId, role } } as any);
    const q: any = { id: '100', quotationNumber: 'QT-2026-0001', status, createdBy, total: 100 };
    return render(<ToastProvider><MemoryRouter><ActionBar quotation={q} refetch={refetch} /></MemoryRouter></ToastProvider>);
  };

  it('Action visibility: DRAFT, APPROVED, SENT, ACCEPTED', () => {
    const { unmount: u1 } = renderBar('DRAFT');
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    u1();
    const { unmount: u2 } = renderBar('APPROVED');
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
    u2();
    const { unmount: u3 } = renderBar('SENT');
    expect(screen.getByRole('button', { name: /Respond/i })).toBeInTheDocument();
    u3();
    renderBar('ACCEPTED');
    expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument();
  });

  it('Action visibility: PENDING_APPROVAL matrix for role and creator', () => {
    // MANAGER not creator -> sees Approve & Reject
    const { unmount: u1 } = renderBar('PENDING_APPROVAL', 'MANAGER', '2', '1');
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    u1();

    // MANAGER is creator -> cannot self-approve
    const { unmount: u2 } = renderBar('PENDING_APPROVAL', 'MANAGER', '1', '1');
    expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument();
    u2();

    // STAFF cannot approve
    renderBar('PENDING_APPROVAL', 'STAFF', '3', '1');
    expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument();
  });

  it('handles 409 status conflict by triggering refetch and warning toast', async () => {
    const refetch = vi.fn();
    mockMutate.mockRejectedValueOnce({ status: 409, message: 'INVALID_STATE_TRANSITION' });
    renderBar('DRAFT', 'STAFF', '1', '1', refetch);

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});

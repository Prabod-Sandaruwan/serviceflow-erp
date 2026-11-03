import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MilestonesTab } from './MilestonesTab';
import * as authProvider from '../auth/AuthProvider';
import * as hooks from '../milestones/hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../milestones/hooks', () => ({ useMilestones: vi.fn(), useApproveMilestone: vi.fn() }));

const mockMilestones = [
  {
    id: 'm1',
    projectId: 'p1',
    title: 'Design Approval',
    dueDate: '2026-03-01',
    billingAmount: '12000.00',
    status: 'COMPLETED',
    eligibleForInvoice: true,
  },
  {
    id: 'm2',
    projectId: 'p1',
    title: 'MVP Delivery',
    dueDate: '2026-05-01',
    billingAmount: '20000.00',
    status: 'IN_PROGRESS',
    eligibleForInvoice: false,
  },
];

describe('MilestonesTab Component (PROJ-014)', () => {
  const mockApprove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useMilestones).mockReturnValue({
      data: { data: mockMilestones },
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(hooks.useApproveMilestone).mockReturnValue({ mutateAsync: mockApprove, isPending: false } as any);
  });

  const renderTab = (role = 'MANAGER') => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    return render(
      <ToastProvider>
        <MilestonesTab projectId="p1" />
      </ToastProvider>,
    );
  };

  it('renders milestones with title, billing amount, and invoice eligibility', () => {
    renderTab('MANAGER');
    expect(screen.getByText('Design Approval')).toBeInTheDocument();
    expect(screen.getByText('MVP Delivery')).toBeInTheDocument();
    expect(screen.getByText('Eligible')).toBeInTheDocument();
    expect(screen.getByText('Not Eligible')).toBeInTheDocument();
  });

  it('renders Approve button for MANAGER on COMPLETED milestones and calls mutation', async () => {
    mockApprove.mockResolvedValueOnce({ data: { id: 'm1', status: 'APPROVED' } });
    renderTab('MANAGER');

    const approveBtn = screen.getByRole('button', { name: /Approve/i });
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledWith('m1');
    });
  });

  it('hides Approve button for STAFF users', () => {
    renderTab('STAFF');
    expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument();
  });
});

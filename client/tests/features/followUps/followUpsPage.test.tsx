import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FollowUpList from '../../../src/features/followUps/FollowUpList';
import * as hooks from '../../../src/features/followUps/hooks';
import * as exportModule from '../../../src/features/followUps/exportFollowUps';
import { ToastProvider } from '../../../src/components/ui/Toast';

vi.mock('../../../src/features/followUps/hooks', () => ({
  useAllFollowUps: vi.fn(),
  useMarkFollowUpDone: vi.fn(),
}));

describe('FollowUpList Page Feature', () => {
  let queryClient: QueryClient;
  const mockMarkDone = vi.fn();
  const mockFollowUps = [
    { id: 'fu-1', leadId: '10', scheduledAt: '2026-11-20T10:00:00.000Z', status: 'PENDING', notes: 'Initial discovery call', isOverdue: false },
    { id: 'fu-2', leadId: '12', scheduledAt: '2026-11-01T08:00:00.000Z', status: 'PENDING', notes: 'Send proposal review', isOverdue: true },
    { id: 'fu-3', leadId: '15', scheduledAt: '2026-11-10T14:00:00.000Z', status: 'DONE', notes: 'Demo completed', isOverdue: false },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    vi.mocked(hooks.useAllFollowUps).mockReturnValue({
      data: { data: mockFollowUps, meta: { total: 3, page: 1, limit: 20, totalPages: 1 } },
      isLoading: false,
    } as any);
    vi.mocked(hooks.useMarkFollowUpDone).mockReturnValue({
      mutateAsync: mockMarkDone,
      isPending: false,
    } as any);
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <FollowUpList />
          </MemoryRouter>
        </QueryClientProvider>
      </ToastProvider>
    );

  it('renders summary metric cards, filter controls, and follow-up rows with overdue badges', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 1, name: 'Follow-ups' })).toBeInTheDocument();
    expect(screen.getByText('TOTAL SCHEDULED')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL OVERDUE')).toBeInTheDocument();
    expect(screen.getByText('Initial discovery call')).toBeInTheDocument();
    expect(screen.getByText('Send proposal review')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('filters rows by search input', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/search notes or lead id/i);
    fireEvent.change(searchInput, { target: { value: 'discovery' } });
    expect(screen.getByText('Initial discovery call')).toBeInTheDocument();
    expect(screen.queryByText('Send proposal review')).not.toBeInTheDocument();
  });

  it('triggers mark done mutation when Mark Done button is clicked', async () => {
    mockMarkDone.mockResolvedValueOnce({ data: { id: 'fu-1', status: 'DONE' } });
    renderComponent();
    const doneButtons = screen.getAllByRole('button', { name: /Mark Done/i });
    fireEvent.click(doneButtons[0]);
    await waitFor(() => expect(mockMarkDone).toHaveBeenCalledWith('fu-1'));
  });

  it('triggers export CSV when button is clicked', async () => {
    const spyExport = vi.spyOn(exportModule, 'downloadAllFollowUpsCsv').mockResolvedValue(undefined as any);
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/i }));
    await waitFor(() => expect(spyExport).toHaveBeenCalledWith(mockFollowUps));
  });
});

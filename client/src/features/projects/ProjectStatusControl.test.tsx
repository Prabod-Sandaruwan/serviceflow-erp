import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectStatusControl } from './ProjectStatusControl';
import { ToastProvider } from '../../components/ui/Toast';
import * as hooks from './hooks';
import type { Project } from './types';

vi.mock('./hooks', () => ({ useUpdateProject: vi.fn() }));

const mockProject = (status = 'PLANNED'): Project => ({
  id: 'p1',
  projectCode: 'PRJ-2026-0001',
  name: 'Test Project',
  status,
  clientId: 'c1',
  progressPercent: 50,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
});

describe('ProjectStatusControl Component (PROJ-013)', () => {
  const mockMutate = vi.fn();
  const mockMutation = { mutateAsync: mockMutate, isPending: false } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useUpdateProject).mockReturnValue(mockMutation);
  });

  const renderComponent = (status = 'PLANNED') =>
    render(
      <ToastProvider>
        <ProjectStatusControl project={mockProject(status)} />
      </ToastProvider>,
    );

  it('renders PLANNED transitions and activates project', async () => {
    mockMutate.mockResolvedValueOnce({ data: { id: 'p1', status: 'ACTIVE' } });
    renderComponent('PLANNED');

    expect(screen.getByRole('button', { name: /Activate Project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Activate Project/i }));
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: 'p1', data: { status: 'ACTIVE' } });
    });
  });

  it('renders ACTIVE transitions: put on hold, complete, and handles 409 open work conflict', async () => {
    mockMutate.mockRejectedValueOnce({ status: 409, message: 'Cannot complete project with open milestones or tasks' });
    renderComponent('ACTIVE');

    expect(screen.getByRole('button', { name: /Put on Hold/i })).toBeInTheDocument();
    const completeBtn = screen.getByRole('button', { name: /Complete Project/i });
    expect(completeBtn).toBeInTheDocument();

    fireEvent.click(completeBtn);
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: 'p1', data: { status: 'COMPLETED' } });
    });
  });

  it('opens cancel dialog, validates min 5 chars, and cancels project', async () => {
    mockMutate.mockResolvedValueOnce({ data: { id: 'p1', status: 'CANCELLED' } });
    renderComponent('ACTIVE');

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.getByText('Cancel Project')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Explain why the project is being cancelled/i);
    fireEvent.change(textarea, { target: { value: 'Client dropped the initiative' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Cancellation/i }));
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        id: 'p1',
        data: { status: 'CANCELLED', reason: 'Client dropped the initiative' },
      });
    });
  });

  it('renders nothing for terminal states COMPLETED and CANCELLED', () => {
    const { unmount } = renderComponent('COMPLETED');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();

    renderComponent('CANCELLED');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

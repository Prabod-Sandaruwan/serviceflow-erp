import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskForm } from './TaskForm';
import * as authProvider from '../auth/AuthProvider';
import * as hooks from './hooks';
import { ToastProvider } from '../../components/ui/Toast';
import type { Task } from './types';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('./hooks', () => ({ useCreateTask: vi.fn(), useUpdateTask: vi.fn() }));

const mockTask: Task = {
  id: 't1', projectId: 'p1', title: 'Implement Auth', description: 'Setup JWT/session',
  priority: 'HIGH', status: 'TODO', dueDate: '2026-03-01', assigneeId: 'e1',
  createdAt: '2026-01-01', updatedAt: '2026-01-02',
};

describe('TaskForm Component (PROJ-014 & PROJ-015)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useCreateTask).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(hooks.useUpdateTask).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderForm = (role = 'STAFF', task: Task | null = mockTask, milestones: any[] = []) => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    return render(
      <ToastProvider>
        <TaskForm task={task} projectId="p1" milestones={milestones} onClose={vi.fn()} />
      </ToastProvider>,
    );
  };

  it('validates required fields on task creation (empty title blocks submission)', async () => {
    renderForm('MANAGER', null);
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('STAFF users find title, priority, assigneeId disabled, while status is enabled', async () => {
    renderForm('STAFF', mockTask);
    expect(screen.getByLabelText(/^Title/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Priority/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Assignee/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Description/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Due Date/i)).toBeDisabled();

    const statusSelect = screen.getByLabelText(/^Status/i);
    expect(statusSelect).not.toBeDisabled();
    fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ id: 't1', data: { status: 'IN_PROGRESS' } });
    });
  });

  it('MANAGER users can edit all fields when modifying a task', () => {
    renderForm('MANAGER', mockTask);
    expect(screen.getByLabelText(/^Title/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Priority/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Assignee/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Status/i)).not.toBeDisabled();
  });

  it('filters out APPROVED and CANCELLED milestones from creation dropdown', () => {
    const ms = [
      { id: 'm1', title: 'Pending Phase', status: 'PENDING' },
      { id: 'm2', title: 'Active Phase', status: 'IN_PROGRESS' },
      { id: 'm3', title: 'Approved Scope', status: 'APPROVED' },
      { id: 'm4', title: 'Cancelled Scope', status: 'CANCELLED' },
    ];
    renderForm('MANAGER', null, ms);
    const milestoneSelect = screen.getByLabelText(/^Milestone/i);
    const options = Array.from(milestoneSelect.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toContain('Pending Phase');
    expect(options).toContain('Active Phase');
    expect(options).not.toContain('Approved Scope');
    expect(options).not.toContain('Cancelled Scope');
  });
});

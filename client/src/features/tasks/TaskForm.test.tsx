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
  id: 't1',
  projectId: 'p1',
  title: 'Implement Auth',
  description: 'Setup JWT/session',
  priority: 'HIGH',
  status: 'TODO',
  dueDate: '2026-03-01',
  assigneeId: 'e1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
};

describe('TaskForm Component (PROJ-014)', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useCreateTask).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(hooks.useUpdateTask).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderForm = (role = 'STAFF', task: Task | null = mockTask) => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    return render(
      <ToastProvider>
        <TaskForm task={task} projectId="p1" onClose={vi.fn()} />
      </ToastProvider>,
    );
  };

  it('STAFF users can ONLY edit the status field (all other fields are disabled)', async () => {
    renderForm('STAFF', mockTask);

    expect(screen.getByLabelText(/^Title/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Description/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Priority/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Assignee/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Milestone/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Due Date/i)).toBeDisabled();

    // Status select must be ENABLED
    const statusSelect = screen.getByLabelText(/^Status/i);
    expect(statusSelect).not.toBeDisabled();

    fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      // Must submit ONLY { status: 'IN_PROGRESS' } when role is STAFF
      expect(mockUpdate).toHaveBeenCalledWith({
        id: 't1',
        data: { status: 'IN_PROGRESS' },
      });
    });
  });

  it('MANAGER users can edit all fields when modifying a task', () => {
    renderForm('MANAGER', mockTask);

    expect(screen.getByLabelText(/^Title/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Description/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Priority/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Status/i)).not.toBeDisabled();
  });
});

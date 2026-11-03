import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksTab } from './TasksTab';
import * as authProvider from '../auth/AuthProvider';
import * as taskHooks from '../tasks/hooks';
import * as adminHooks from '../admin/hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../tasks/hooks', () => ({
  useProjectTasks: vi.fn(),
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
}));
vi.mock('../admin/hooks', () => ({ useEmployees: vi.fn() }));

const mockTasks = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Deploy to Staging',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-02-01',
    isOverdue: true,
    assignee: { id: 'e1', fullName: 'Charlie Staff' },
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Write Documentation',
    priority: 'LOW',
    status: 'TODO',
    dueDate: '2026-10-01',
    isOverdue: false,
    assignee: null,
  },
];

describe('TasksTab Component (PROJ-014)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(taskHooks.useProjectTasks).mockReturnValue({
      data: { data: mockTasks },
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(taskHooks.useCreateTask).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(taskHooks.useUpdateTask).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(adminHooks.useEmployees).mockReturnValue({
      data: { data: [{ id: 'e1', full_name: 'Charlie Staff' }] },
    } as any);
  });

  const renderTab = (role = 'MANAGER') => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    return render(
      <ToastProvider>
        <TasksTab projectId="p1" />
      </ToastProvider>,
    );
  };

  it('renders tasks with overdue badge and displays Create Task for MANAGER', () => {
    renderTab('MANAGER');
    expect(screen.getByText('Deploy to Staging')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getAllByText('Charlie Staff').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /\+ Create Task/i })).toBeInTheDocument();
  });

  it('hides Create Task button for STAFF role', () => {
    renderTab('STAFF');
    expect(screen.getByText('Deploy to Staging')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+ Create Task/i })).not.toBeInTheDocument();
  });

  it('opens edit modal on clicking Edit', () => {
    renderTab('STAFF');
    const editBtns = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });
});

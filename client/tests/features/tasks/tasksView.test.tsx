import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TasksPage from '../../../src/features/tasks/TasksPage';
import * as authProvider from '../../../src/features/auth/AuthProvider';
import * as hooks from '../../../src/features/tasks/hooks';
import * as exportTasks from '../../../src/features/tasks/exportTasks';

vi.mock('../../../src/features/auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('../../../src/features/tasks/hooks', () => ({
  useTasks: vi.fn(),
  useUpdateTask: vi.fn(),
  useCreateTask: vi.fn(),
}));
vi.mock('../../../src/features/tasks/exportTasks', () => ({
  downloadAllTasksCsv: vi.fn(),
}));

const mockTasks = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Project Documentation Review',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '2026-12-02',
    isOverdue: false,
    assignee: { id: 'e1', fullName: 'Charlie Staff' },
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Production Key Provisioning',
    priority: 'HIGH',
    status: 'DONE',
    dueDate: null,
    isOverdue: false,
    assignee: { id: 'e1', fullName: 'Charlie Staff' },
  },
];

describe('Tasks Management Page Redesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useUpdateTask).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(hooks.useCreateTask).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
  });

  const renderComponent = () => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role: 'ADMIN' } } as any);
    vi.mocked(hooks.useTasks).mockReturnValue({
      data: { data: mockTasks, meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const client = new QueryClient();
    return render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/tasks']}>
          <TasksPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders summary metric cards, switches between Table and Board, and exports tasks', () => {
    renderComponent();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getAllByText('To Do').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Done').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancelled').length).toBeGreaterThan(0);

    const exportBtn = screen.getByRole('button', { name: /Export Tasks/i });
    fireEvent.click(exportBtn);
    expect(exportTasks.downloadAllTasksCsv).toHaveBeenCalledWith(mockTasks);

    const boardBtn = screen.getByRole('button', { name: /^Board$/i });
    fireEvent.click(boardBtn);
    expect(screen.getAllByText('Project Documentation Review').length).toBeGreaterThan(0);

    const tableBtn = screen.getByRole('button', { name: /^Table$/i });
    fireEvent.click(tableBtn);
    expect(screen.getByText('Project Documentation Review')).toBeInTheDocument();
  });
});

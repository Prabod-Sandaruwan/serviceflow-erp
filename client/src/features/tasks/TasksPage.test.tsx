import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TasksPage } from './TasksPage';
import * as authProvider from '../auth/AuthProvider';
import * as hooks from './hooks';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('./hooks', () => ({ useTasks: vi.fn(), useUpdateTask: vi.fn() }));

const mockTasks = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Setup Database',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueDate: '2026-02-15',
    isOverdue: true,
    assignee: { id: 'e1', fullName: 'Alice Dev' },
  },
];

describe('TasksPage Component (PROJ-014)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useUpdateTask).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
  });

  const renderPage = (role = 'STAFF', employeeId = 'e1') => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role, employeeId } } as any);
    vi.mocked(hooks.useTasks).mockReturnValue({
      data: { data: mockTasks, meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    return render(
      <MemoryRouter initialEntries={['/tasks']}>
        <TasksPage />
      </MemoryRouter>,
    );
  };

  it('renders tasks list with overdue badge and filter dropdowns', () => {
    renderPage('MANAGER');
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Setup Database')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('URGENT')).toBeInTheDocument();
    expect(screen.getByText('Alice Dev')).toBeInTheDocument();
  });

  it('scopes query to current employeeId for STAFF users', () => {
    renderPage('STAFF', 'emp-42');
    expect(hooks.useTasks).toHaveBeenCalledWith(
      expect.objectContaining({ assigneeId: 'emp-42' }),
    );
  });

  it('toggles overdue only checkbox filter', () => {
    renderPage('MANAGER');
    const checkbox = screen.getByLabelText(/Overdue Only/i);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});

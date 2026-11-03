import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProjectsPage } from './ProjectsPage';
import * as hooks from './hooks';

vi.mock('./hooks', () => ({ useProjects: vi.fn() }));

const mockProjects = [
  {
    id: 'p-1',
    projectCode: 'PRJ-2026-0001',
    name: 'Website Redesign',
    status: 'ACTIVE',
    progressPercent: 75,
    client: { id: 'c-1', displayName: 'Acme Corp' },
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
    clientId: 'c-1',
  },
  {
    id: 'p-2',
    projectCode: 'PRJ-2026-0002',
    name: 'Mobile App',
    status: 'COMPLETED',
    progressPercent: 100,
    client: null,
    createdAt: '2026-01-03',
    updatedAt: '2026-01-04',
    clientId: 'c-2',
  },
];

describe('ProjectsPage Component (PROJ-012)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (initial = ['/projects']) =>
    render(
      <MemoryRouter initialEntries={initial}>
        <ProjectsPage />
      </MemoryRouter>,
    );

  it('renders project list table with columns, data rows, status and progress', () => {
    vi.mocked(hooks.useProjects).mockReturnValue({
      data: { data: mockProjects, meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    renderPage();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('PRJ-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('PRJ-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders empty state when no projects exist', () => {
    vi.mocked(hooks.useProjects).mockReturnValue({
      data: { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    renderPage();
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('updates search filter input and status dropdown', () => {
    vi.mocked(hooks.useProjects).mockReturnValue({
      data: { data: [], meta: { page: 1, pageSize: 20, total: 0 } },
      isLoading: false,
    } as any);

    renderPage();
    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    expect((searchInput as HTMLInputElement).value).toBe('Alpha');

    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'ACTIVE' } });
    expect((statusSelect as HTMLSelectElement).value).toBe('ACTIVE');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProjectDetailPage } from './ProjectDetailPage';
import * as hooks from './hooks';
import * as authProvider from '../auth/AuthProvider';

vi.mock('./hooks', () => ({
  useProject: vi.fn(),
  useUpdateProject: vi.fn(),
}));

vi.mock('../auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

const mockProject = {
  id: 'p1',
  projectCode: 'PRJ-2026-0001',
  name: 'Acme Portal',
  description: 'A full redesign project',
  status: 'ACTIVE',
  clientId: 'c1',
  budgetAmount: '25000.00',
  progressPercent: 40,
  client: { id: 'c1', displayName: 'Acme Corp' },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
};

describe('ProjectDetailPage Component (PROJ-013)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: '1', role: 'ADMIN' } } as any);
    vi.mocked(hooks.useUpdateProject).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/projects/p1']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders project header, back link, status controls and overview tab', () => {
    vi.mocked(hooks.useProject).mockReturnValue({
      data: { data: mockProject },
      isLoading: false,
      isError: false,
    } as any);

    renderComponent();

    expect(screen.getByText('PRJ-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Acme Portal')).toBeInTheDocument();
    expect(screen.getByText('A full redesign project')).toBeInTheDocument();
    expect(screen.getByText(/Back to Projects/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Project/i })).toBeInTheDocument();
  });

  it('renders empty/loading state via QueryBoundary when no data', () => {
    vi.mocked(hooks.useProject).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    renderComponent();
    expect(screen.queryByText('Acme Portal')).not.toBeInTheDocument();
  });
});


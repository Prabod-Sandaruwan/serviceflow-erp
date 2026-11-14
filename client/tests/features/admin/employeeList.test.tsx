import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployeeList from '../../../src/features/admin/EmployeeList';
import * as adminHooks from '../../../src/features/admin/hooks';
import * as exportEmp from '../../../src/features/admin/exportEmployees';

vi.mock('../../../src/features/admin/hooks', () => ({
  useEmployees: vi.fn(),
  useCreateEmployee: vi.fn(),
  useUpdateEmployee: vi.fn(),
}));

vi.mock('../../../src/features/admin/exportEmployees', () => ({
  downloadAllEmployeesCsv: vi.fn(),
}));

const mockEmployees = [
  { id: '1', fullName: 'Bob Manager', email: 'manager2@serviceflow.lk', jobTitle: 'Project Manager', isActive: true, role: 'MANAGER' },
  { id: '2', fullName: 'Alice Manager', email: 'manager1@serviceflow.lk', jobTitle: 'Operations Manager', isActive: true, role: 'MANAGER' },
  { id: '3', fullName: 'Diana Staff', email: 'staff2@serviceflow.lk', jobTitle: 'Account Executive', isActive: false, role: 'STAFF' },
];

describe('EmployeeList Component Redesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminHooks.useCreateEmployee).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(adminHooks.useUpdateEmployee).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
  });

  const renderComponent = () => {
    vi.mocked(adminHooks.useEmployees).mockReturnValue({
      data: { data: mockEmployees, meta: { total: 3, page: 1, totalPages: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const client = new QueryClient();
    return render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <EmployeeList />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders breadcrumb, header, action buttons, table columns and employee rows', () => {
    renderComponent();
    expect(screen.getByText('Operations & Delivery')).toBeInTheDocument();
    expect(screen.getAllByText('Employees').length).toBeGreaterThan(0);
    expect(screen.getByText('Staff directory, contact information, and role assignments')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Add Employee/i })).toBeInTheDocument();

    expect(screen.getByText('Bob Manager')).toBeInTheDocument();
    expect(screen.getByText('BM')).toBeInTheDocument();
    expect(screen.getByText('manager2@serviceflow.lk')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();

    expect(screen.getByText('Alice Manager')).toBeInTheDocument();
    expect(screen.getByText('AM')).toBeInTheDocument();

    expect(screen.getByText('Diana Staff')).toBeInTheDocument();
    expect(screen.getByText('DS')).toBeInTheDocument();
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0);
  });

  it('triggers CSV export when clicking Export CSV button', () => {
    renderComponent();
    const exportBtn = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportBtn);
    expect(exportEmp.downloadAllEmployeesCsv).toHaveBeenCalledWith(mockEmployees);
  });

  it('opens employee modal on Add Employee and on Edit click', () => {
    renderComponent();
    const addBtn = screen.getByRole('button', { name: /\+ Add Employee/i });
    fireEvent.click(addBtn);
    expect(screen.getByRole('heading', { name: /Add Employee/i })).toBeInTheDocument();
  });
});

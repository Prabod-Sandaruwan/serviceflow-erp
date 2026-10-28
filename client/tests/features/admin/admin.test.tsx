import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import UserList from '../../../src/features/admin/UserList';
import { EmployeeModal } from '../../../src/features/admin/EmployeeModal';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import * as adminHooks from '../../../src/features/admin/hooks';
import { ApiError } from '../../../src/lib/ApiError';

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../src/features/admin/hooks', () => ({
  useUsers: vi.fn(),
  useCreateUser: vi.fn(),
  useUpdateUser: vi.fn(),
  useResetPassword: vi.fn(),
  useEmployees: vi.fn(),
  useCreateEmployee: vi.fn(),
  useUpdateEmployee: vi.fn(),
}));

describe('Admin User and Employee Management', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UserList disables role/active edits for the logged-in user's own row", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'admin@serviceflow.lk', role: 'ADMIN' },
      role: 'ADMIN',
      status: 'authenticated',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    vi.mocked(adminHooks.useUsers).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: [{ id: 'user-1', email: 'admin@serviceflow.lk', role: 'ADMIN', isActive: true }],
        meta: { page: 1, totalPages: 1 },
      },
      refetch: vi.fn(),
    } as any);

    vi.mocked(adminHooks.useResetPassword).mockReturnValue({ mutateAsync: vi.fn() } as any);
    vi.mocked(adminHooks.useUpdateUser).mockReturnValue({ mutateAsync: vi.fn() } as any);
    vi.mocked(adminHooks.useCreateUser).mockReturnValue({ mutateAsync: vi.fn() } as any);

    render(<UserList />);

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    const roleSelect = screen.getByLabelText('Role');
    const statusSelect = screen.getByLabelText('Status');

    expect(roleSelect).toBeDisabled();
    expect(statusSelect).toBeDisabled();
  });

  it('Employee form handles server validation errors correctly', async () => {
    const mockCreate = vi.fn().mockRejectedValueOnce(
      new ApiError(422, 'VALIDATION_FAILED', 'Invalid input', [
        { field: 'email', issue: 'Email already exists' },
      ]),
    );

    vi.mocked(adminHooks.useCreateEmployee).mockReturnValue({ mutateAsync: mockCreate } as any);
    vi.mocked(adminHooks.useUpdateEmployee).mockReturnValue({ mutateAsync: vi.fn() } as any);

    render(<EmployeeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Job Title'), { target: { value: 'Developer' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });
});

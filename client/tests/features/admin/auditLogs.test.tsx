import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogs from '../../../src/features/admin/AuditLogs';
import * as adminHooks from '../../../src/features/admin/hooks';

vi.mock('../../../src/features/admin/hooks', () => ({
  useAuditLogs: vi.fn(),
}));

describe('AuditLogs Component', () => {
  const dummyLogs = [
    {
      id: 'log-101',
      createdAt: '2026-10-29T10:00:00Z',
      actor: { email: 'admin@serviceflow.lk' },
      actorRole: 'ADMIN',
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: '202',
      before: null,
      after: { email: 'staff1@serviceflow.lk', role: 'STAFF' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the audit log table and filter bar', () => {
    vi.mocked(adminHooks.useAuditLogs).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: dummyLogs,
        meta: { page: 1, totalPages: 1, total: 1 },
      },
      refetch: vi.fn(),
    } as any);

    render(<AuditLogs />);

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByLabelText('Date From')).toBeInTheDocument();
    expect(screen.getByLabelText('Date To')).toBeInTheDocument();
    expect(screen.getByLabelText('Entity Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Action')).toBeInTheDocument();

    expect(screen.getByText('log-101')).toBeInTheDocument();
    expect(screen.getByText('USER_CREATED')).toBeInTheDocument();
    expect(screen.getByText(/USER #202/)).toBeInTheDocument();
    expect(screen.getByText('admin@serviceflow.lk')).toBeInTheDocument();
  });

  it("toggling the 'Details' button expands the row to show JSON text", () => {
    vi.mocked(adminHooks.useAuditLogs).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: dummyLogs,
        meta: { page: 1, totalPages: 1, total: 1 },
      },
      refetch: vi.fn(),
    } as any);

    render(<AuditLogs />);

    expect(screen.queryByText(/staff1@serviceflow\.lk/i)).not.toBeInTheDocument();

    const detailsBtn = screen.getByRole('button', { name: /Details/i });
    fireEvent.click(detailsBtn);

    expect(screen.getByText(/staff1@serviceflow\.lk/i)).toBeInTheDocument();

    fireEvent.click(detailsBtn);
    expect(screen.queryByText(/staff1@serviceflow\.lk/i)).not.toBeInTheDocument();
  });
});


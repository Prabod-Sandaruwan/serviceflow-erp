import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LeadDetailPage from '../../../src/features/leads/LeadDetailPage';
import * as leadHooks from '../../../src/features/leads/hooks';
import * as clientHooks from '../../../src/features/clients/hooks';

vi.mock('../../../src/features/leads/hooks', () => ({
  useLead: vi.fn(),
  useConvertLead: vi.fn(),
  useFollowUps: vi.fn(),
  useCreateFollowUp: vi.fn(),
  useUpdateFollowUp: vi.fn(),
}));

vi.mock('../../../src/features/clients/hooks', () => ({
  useClients: vi.fn(),
}));

describe('LeadDetailPage Component (CRM-011, CRM-012)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leadHooks.useFollowUps).mockReturnValue({ isLoading: false, data: { data: [] } } as any);
    vi.mocked(leadHooks.useCreateFollowUp).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(leadHooks.useUpdateFollowUp).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(leadHooks.useConvertLead).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.mocked(clientHooks.useClients).mockReturnValue({ data: { data: [] } } as any);
  });

  it('renders lead details, followups, and opens ConvertDialog', () => {
    vi.mocked(leadHooks.useLead).mockReturnValue({
      isLoading: false, isError: false,
      data: {
        data: {
          id: '101', title: 'Smart Grid Project', status: 'QUALIFIED', expectedValue: 45000,
          ownerId: '5', owner: { id: '5', email: 'owner@grid.lk', fullName: 'Grid Master' },
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/leads/101']}>
        <Routes><Route path="/leads/:id" element={<LeadDetailPage />} /></Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Smart Grid Project/i })).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('$45,000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Convert to Client/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Follow-ups & Activities/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Convert to Client/i }));
    expect(screen.getByRole('heading', { name: /Convert Lead to Client/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Create new client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Link existing client/i)).toBeInTheDocument();
  });

  it('renders View Client link when lead is converted', () => {
    vi.mocked(leadHooks.useLead).mockReturnValue({
      isLoading: false, isError: false,
      data: {
        data: {
          id: '102', title: 'Solar Farm', status: 'WON', convertedClientId: '202',
          ownerId: '5', expectedValue: 60000,
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/leads/102']}>
        <Routes><Route path="/leads/:id" element={<LeadDetailPage />} /></Routes>
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /Convert to Client/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Client/i })).toBeInTheDocument();
  });
});

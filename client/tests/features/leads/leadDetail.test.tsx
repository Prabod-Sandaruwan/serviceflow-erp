import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LeadDetailPage from '../../../src/features/leads/LeadDetailPage';
import * as leadHooks from '../../../src/features/leads/hooks';

vi.mock('../../../src/features/leads/hooks', () => ({
  useLead: vi.fn(),
}));

describe('LeadDetailPage Component (CRM-011)', () => {
  it('renders lead details, status badge, timeline section and edit button', () => {
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
    expect(screen.getByRole('link', { name: /Edit Lead/i })).toHaveAttribute('href', '/leads/101/edit');
    expect(screen.getByRole('heading', { name: /Timeline/i })).toBeInTheDocument();
  });
});

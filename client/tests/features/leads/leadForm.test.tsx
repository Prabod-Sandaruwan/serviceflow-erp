import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LeadFormPage from '../../../src/features/leads/LeadFormPage';
import * as leadHooks from '../../../src/features/leads/hooks';

vi.mock('../../../src/features/leads/hooks', () => ({
  useLead: vi.fn(), useCreateLead: vi.fn(), useUpdateLead: vi.fn(),
}));

describe('LeadFormPage Component (CRM-011)', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leadHooks.useLead).mockReturnValue({ isLoading: false, isError: false, data: undefined } as any);
    vi.mocked(leadHooks.useCreateLead).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false } as any);
    vi.mocked(leadHooks.useUpdateLead).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false } as any);
  });

  it('renders new lead form and submits creation payload', async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: { id: 'lead-1' } });
    render(
      <MemoryRouter initialEntries={['/leads/new']}>
        <Routes><Route path="/leads/new" element={<LeadFormPage />} /></Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /New Lead/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Lead Title/i), { target: { value: 'New Enterprise Deal' } });
    fireEvent.change(screen.getByLabelText(/Estimated Value/i), { target: { value: '50000' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Lead/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ expectedValue: 50000 }));
    });
  });

  it('restricts status options in edit mode and reveals lostReason when LOST is selected', async () => {
    vi.mocked(leadHooks.useLead).mockReturnValue({
      isLoading: false, isError: false,
      data: { data: { id: '1', title: 'Solar Project', status: 'NEW', expectedValue: 12000 } },
    } as any);

    render(
      <MemoryRouter initialEntries={['/leads/1/edit']}>
        <Routes><Route path="/leads/:id/edit" element={<LeadFormPage />} /></Routes>
      </MemoryRouter>
    );

    const statusSelect = await screen.findByLabelText(/Pipeline Status/i);
    const options = Array.from((statusSelect as HTMLSelectElement).options).map((o) => o.value);
    expect(options).toEqual(['NEW', 'CONTACTED', 'LOST']);
    expect(options).not.toContain('WON');
    expect(options).not.toContain('CONVERTED');

    expect(screen.queryByLabelText(/Lost Reason/i)).not.toBeInTheDocument();
    fireEvent.change(statusSelect, { target: { value: 'LOST' } });
    expect(screen.getByLabelText(/Lost Reason/i)).toBeInTheDocument();
  });
});

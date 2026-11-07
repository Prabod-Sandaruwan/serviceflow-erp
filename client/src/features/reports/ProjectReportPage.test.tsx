import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectReportPage } from './ProjectReportPage';
import * as hooks from './hooks';

vi.mock('./hooks', async () => ({
  ...(await vi.importActual('./hooks')),
  useProjectReport: vi.fn(),
  useDownloadCsv: vi.fn(),
}));

describe('ProjectReportPage Component (FIN-013)', () => {
  let queryClient: QueryClient;
  const mockMutate = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    vi.mocked(hooks.useDownloadCsv).mockReturnValue({ mutate: mockMutate, isPending: false } as any);
  });

  it('Test 1: renders Estimated project profitability heading inside overflow-x-auto container', () => {
    vi.mocked(hooks.useProjectReport).mockReturnValue({
      data: {
        data: [
          {
            projectId: '101', name: 'Alpha Portal', projectCode: 'PRJ-101',
            revenue: '80000.00', billed: '80000.00', collected: '50000.00',
            expenses: '20000.00', estimatedProfitability: '60000.00', margin: '75.00%', progress: 62.5,
          },
        ],
      },
      isLoading: false, isError: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectReportPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Estimated project profitability')).toBeInTheDocument();
    expect(screen.getByText('Alpha Portal')).toBeInTheDocument();
    expect(screen.getByText('$60,000.00')).toBeInTheDocument();

    const table = screen.getByTestId('project-report-table');
    expect(table.parentElement?.className).toContain('overflow-x-auto');
  });

  it('Test 2: shows date validation error and triggers download on valid click', () => {
    vi.mocked(hooks.useProjectReport).mockReturnValue({ data: { data: [] }, isLoading: false, isError: false } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectReportPage />
      </QueryClientProvider>
    );

    const fromInput = screen.getByLabelText(/Filter from date/i);
    const toInput = screen.getByLabelText(/Filter to date/i);

    fireEvent.change(fromInput, { target: { value: '2026-12-31' } });
    fireEvent.change(toInput, { target: { value: '2026-01-01' } });
    expect(screen.getByTestId('date-filter-error')).toHaveTextContent(/From date must be on or before To date/i);

    fireEvent.change(fromInput, { target: { value: '2026-01-01' } });
    fireEvent.click(screen.getByTestId('download-csv-btn'));
    expect(mockMutate).toHaveBeenCalled();
  });
});

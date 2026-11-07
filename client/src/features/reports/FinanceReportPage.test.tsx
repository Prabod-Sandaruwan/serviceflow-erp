import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinanceReportPage } from './FinanceReportPage';
import * as hooks from './hooks';

vi.mock('./hooks', async () => ({
  ...(await vi.importActual('./hooks')),
  useFinanceReport: vi.fn(),
  useDownloadCsv: vi.fn(),
}));

describe('FinanceReportPage Component (FIN-013)', () => {
  let queryClient: QueryClient;
  const mockMutate = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    vi.mocked(hooks.useDownloadCsv).mockReturnValue({ mutate: mockMutate, isPending: false } as any);
  });

  it('Test 1: renders financial report metrics in an overflow-x-auto container', () => {
    vi.mocked(hooks.useFinanceReport).mockReturnValue({
      data: {
        data: {
          from: '2026-11-01', to: '2026-11-30', revenue: '100000.00', paymentsReceived: '40000.00',
          outstanding: '60000.00', expenses: '25000.00', estimatedProfitability: '75000.00', margin: '75.00%',
        },
      },
      isLoading: false, isError: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <FinanceReportPage />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('metric-revenue')).toHaveTextContent('$100,000.00');
    expect(screen.getByTestId('metric-payments')).toHaveTextContent('$40,000.00');
    expect(screen.getByTestId('metric-profit')).toHaveTextContent('$75,000.00');

    const table = screen.getByTestId('finance-report-table');
    expect(table.parentElement?.className).toContain('overflow-x-auto');
  });

  it('Test 2: shows validation error when from > to and triggers download on valid click', () => {
    vi.mocked(hooks.useFinanceReport).mockReturnValue({ data: { data: {} }, isLoading: false, isError: false } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <FinanceReportPage />
      </QueryClientProvider>
    );

    const fromInput = screen.getByLabelText(/Filter from date/i);
    const toInput = screen.getByLabelText(/Filter to date/i);

    fireEvent.change(fromInput, { target: { value: '2026-12-01' } });
    fireEvent.change(toInput, { target: { value: '2026-11-01' } });

    expect(screen.getByTestId('date-filter-error')).toHaveTextContent(/From date must be on or before To date/i);

    fireEvent.change(fromInput, { target: { value: '2026-11-01' } });
    expect(screen.queryByTestId('date-filter-error')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('download-csv-btn'));
    expect(mockMutate).toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReportDateFilter } from './ReportDateFilter';

describe('ReportDateFilter Component (FIN-014)', () => {
  it('Test 1 (Date Validation): shows error message and disables download when from > to', () => {
    const handleApply = vi.fn();
    const handleDownload = vi.fn();

    render(
      <ReportDateFilter
        from="2026-01-01"
        to="2026-01-31"
        onApply={handleApply}
        onDownloadCsv={handleDownload}
      />
    );

    const fromInput = screen.getByLabelText('Filter from date');
    const toInput = screen.getByLabelText('Filter to date');
    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    const downloadBtn = screen.getByTestId('download-csv-btn');

    // Initial valid state
    expect(screen.queryByTestId('date-filter-error')).not.toBeInTheDocument();
    expect(downloadBtn).not.toBeDisabled();

    // Enter invalid date range where from > to
    fireEvent.change(fromInput, { target: { value: '2026-12-31' } });
    fireEvent.change(toInput, { target: { value: '2026-01-01' } });

    // Assert validation error appears
    expect(screen.getByTestId('date-filter-error')).toBeInTheDocument();
    expect(screen.getByText('From date must be on or before To date')).toBeInTheDocument();

    // Assert download button is disabled
    expect(downloadBtn).toBeDisabled();
    fireEvent.click(downloadBtn);
    expect(handleDownload).not.toHaveBeenCalled();

    // Assert submitting does not trigger onApply
    fireEvent.click(applyBtn);
    expect(handleApply).not.toHaveBeenCalled();
  });

  it('Test 2 (Valid Range): permits apply and download when from <= to', () => {
    const handleApply = vi.fn();
    const handleDownload = vi.fn();

    render(
      <ReportDateFilter
        from="2026-01-01"
        to="2026-01-31"
        onApply={handleApply}
        onDownloadCsv={handleDownload}
      />
    );

    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    const downloadBtn = screen.getByTestId('download-csv-btn');

    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalledWith({ from: '2026-01-01', to: '2026-01-31' });

    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalled();
  });
});


import React, { useState } from 'react';

export interface ReportDateFilterProps {
  from: string;
  to: string;
  onApply: (dates: { from: string; to: string }) => void;
  onDownloadCsv: () => void;
  isDownloading?: boolean;
}

export function ReportDateFilter({
  from: initFrom,
  to: initTo,
  onApply,
  onDownloadCsv,
  isDownloading = false,
}: ReportDateFilterProps) {
  const [from, setFrom] = useState(initFrom);
  const [to, setTo] = useState(initTo);
  const [error, setError] = useState('');

  const isInvalid = Boolean(from && to && from > to);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) {
      setError('From date must be on or before To date');
      return;
    }
    setError('');
    onApply({ from, to });
  };

  const handleDownload = () => {
    if (isInvalid) {
      setError('From date must be on or before To date');
      return;
    }
    setError('');
    onDownloadCsv();
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">From:</label>
          <input
            type="date"
            aria-label="Filter from date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setError(''); }}
            className="rounded border border-slate-300 bg-white p-1 text-xs text-slate-900"
          />
          <label className="text-xs font-semibold text-slate-700">To:</label>
          <input
            type="date"
            aria-label="Filter to date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setError(''); }}
            className="rounded border border-slate-300 bg-white p-1 text-xs text-slate-900"
          />
          <button type="submit" className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900">
            Apply
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading || isInvalid}
          className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          data-testid="download-csv-btn"
        >
          {isDownloading ? 'Downloading...' : 'Download CSV'}
        </button>
      </form>
      {(error || isInvalid) && (
        <p className="text-xs font-medium text-red-600" data-testid="date-filter-error">
          From date must be on or before To date
        </p>
      )}
    </div>
  );
}

export default ReportDateFilter;

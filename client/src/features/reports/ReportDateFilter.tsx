import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';

export interface ReportDateFilterProps {
  from: string;
  to: string;
  onApply: (dates: { from: string; to: string }) => void;
  onDownloadCsv: () => void;
  isDownloading?: boolean;
}

export function ReportDateFilter({
  from: initFrom, to: initTo, onApply, onDownloadCsv, isDownloading = false,
}: ReportDateFilterProps) {
  const [from, setFrom] = useState(initFrom);
  const [to, setTo] = useState(initTo);
  const [error, setError] = useState('');

  const isInvalid = Boolean(from && to && from > to);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) { setError('From date must be on or before To date'); return; }
    setError('');
    onApply({ from, to });
  };

  const handleDownload = () => {
    if (isInvalid) { setError('From date must be on or before To date'); return; }
    setError('');
    onDownloadCsv();
  };

  return (
    <div className="space-y-2 mb-6">
      <form onSubmit={handleApply} className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From:</label>
            <input
              type="date"
              aria-label="Filter from date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setError(''); }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To:</label>
            <input
              type="date"
              aria-label="Filter to date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setError(''); }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            />
          </div>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition cursor-pointer">
            Apply
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading || isInvalid}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
          data-testid="download-csv-btn"
        >
          <Download className="w-3.5 h-3.5" />
          {isDownloading ? 'Downloading...' : 'Download CSV'}
        </button>
      </form>
      {(error || isInvalid) && (
        <p className="text-xs font-semibold text-rose-600 px-1" data-testid="date-filter-error">
          From date must be on or before To date
        </p>
      )}
    </div>
  );
}

export default ReportDateFilter;

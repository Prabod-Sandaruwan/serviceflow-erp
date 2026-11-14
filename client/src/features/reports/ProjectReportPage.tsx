import { useState } from 'react';
import { useProjectReport, useDownloadCsv } from './hooks';
import { ReportDateFilter } from './ReportDateFilter';
import { ProjectKpiCards } from './ProjectKpiCards';
import { ProjectReportTable } from './ProjectReportTable';

function getCurrentMonth() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;
  return { from: start, to: end };
}

export function ProjectReportPage() {
  const [dates, setDates] = useState(getCurrentMonth());
  const { data: res, isLoading, isError } = useProjectReport(dates.from, dates.to);
  const downloadMut = useDownloadCsv('projects');
  const list = res?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <span>Finance &amp; Billing</span>
          <span>&rsaquo;</span>
          <span className="text-slate-600 font-medium">Project Reports</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Project Reports</h1>
        <p className="mt-0.5 text-xs text-slate-500">Profitability, billing, milestone collections, and margin breakdowns by project</p>
      </div>

      <ReportDateFilter
        from={dates.from}
        to={dates.to}
        onApply={setDates}
        onDownloadCsv={() => downloadMut.mutate({ from: dates.from, to: dates.to })}
        isDownloading={downloadMut.isPending}
      />

      {isLoading ? (
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">Loading project report...</div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">Failed to load project report.</div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No projects found.</div>
      ) : (
        <>
          <ProjectKpiCards list={list} />
          <ProjectReportTable list={list} />
        </>
      )}
    </div>
  );
}

export default ProjectReportPage;

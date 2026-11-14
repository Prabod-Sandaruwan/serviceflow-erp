const fmt = (v?: string | number) =>
  v !== undefined && v !== null && v !== ''
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

export function ProjectReportTable({ list = [] }: { list: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200/80 text-left text-xs" data-testid="project-report-table">
        <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3.5">Project Name/ID</th>
            <th className="px-4 py-3.5 text-right">Revenue</th>
            <th className="px-4 py-3.5 text-right">Billed</th>
            <th className="px-4 py-3.5 text-right">Collected</th>
            <th className="px-4 py-3.5 text-right">Expenses</th>
            <th className="px-4 py-3.5 text-right font-bold text-slate-900">Estimated project profitability</th>
            <th className="px-4 py-3.5 text-right">Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 bg-white text-slate-900">
          {list.map((p) => {
            const marginNum = parseFloat(p.margin || '0');
            const marginCls = marginNum >= 50 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : marginNum >= 20 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200';
            return (
              <tr key={p.projectId} className="hover:bg-slate-50/50 transition" data-testid={`project-row-${p.projectId}`}>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="font-bold text-slate-900">{p.name || p.projectCode || p.projectId}</div>
                  {p.projectCode && p.name && <div className="text-[11px] text-slate-400 font-mono">{p.projectCode}</div>}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-900">{fmt(p.revenue)}</td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">{fmt(p.billed)}</td>
                <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-medium">{fmt(p.collected)}</td>
                <td className="px-4 py-3.5 text-right font-mono text-rose-600">{fmt(p.expenses)}</td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">{fmt(p.estimatedProfitability)}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${marginCls}`}>
                    {p.margin || '—'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectReportTable;

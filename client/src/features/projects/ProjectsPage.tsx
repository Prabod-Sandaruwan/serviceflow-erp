import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { useProjects } from './hooks';
import { projectColumns } from './columns';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { ProjectStats } from './ProjectStats';
import { ProjectFilterBar } from './ProjectFilterBar';
import { downloadAllProjectsCsv } from './exportProjects';

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => {
      setSearchParams((p) => {
        const n = new URLSearchParams(p);
        if (searchInput.trim()) n.set('search', searchInput.trim());
        else n.delete('search');
        n.set('page', '1');
        return n;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search, setSearchParams]);

  const query = useProjects({ page, status: status || undefined, search: search || undefined });

  const handleStatusChange = (val: string) => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      if (val) n.set('status', val); else n.delete('status');
      n.set('page', '1');
      return n;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    await downloadAllProjectsCsv(query.data?.data || []);
    setIsExporting(false);
  };

  const totalP = query.data?.meta?.totalPages || Math.ceil((query.data?.meta?.total || 0) / 20) || 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>Operations &amp; Delivery</span><span>&rsaquo;</span><span className="text-slate-600 font-medium">Overview</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Projects</h1>
          <p className="mt-0.5 text-xs text-slate-500">Track delivery, tasks, milestones, and progress</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={handleExport} disabled={isExporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />{isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link to="/quotations" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition text-decoration-none">
            <Plus className="w-4 h-4" />New Project
          </Link>
        </div>
      </div>
      <ProjectStats projects={query.data?.data || []} />
      <ProjectFilterBar search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={handleStatusChange} onReset={() => { setSearchInput(''); setSearchParams(new URLSearchParams()); }} />
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No projects found">
          <Table columns={projectColumns} data={query.data?.data} />
          <Pagination page={Number(page)} totalPages={totalP} onPageChange={(p) => setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; })} />
        </QueryBoundary>
      </div>
    </div>
  );
}

export default ProjectsPage;

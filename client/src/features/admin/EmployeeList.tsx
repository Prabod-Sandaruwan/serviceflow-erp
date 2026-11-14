import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useEmployees } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeFilterBar } from './EmployeeFilterBar';
import { getEmployeeColumns } from './employeeColumns';
import { downloadAllEmployeesCsv } from './exportEmployees';

export default function EmployeeList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const query = useEmployees(page, search, role, status);
  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;
  const total = meta?.total ?? data.length;

  const onEdit = (emp: any) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const columns = getEmployeeColumns(onEdit);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
        <span>Operations &amp; Delivery</span>
        <span>&gt;</span>
        <span className="text-slate-700 font-semibold">Employees</span>
      </nav>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
          <p className="text-xs text-slate-500 mt-1">Staff directory, contact information, and role assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => downloadAllEmployeesCsv(data)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </section>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <EmployeeFilterBar
          search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
          role={role} onRoleChange={(r) => { setRole(r); setPage(1); }}
          status={status} onStatusChange={(s) => { setStatus(s); setPage(1); }}
          onRefresh={() => query.refetch()}
        />

        <QueryBoundary query={query} emptyMessage="No employees found.">
          <Table columns={columns} data={data} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-4 mt-2 border-t border-slate-100">
            <span>Showing {data.length} of {total} total employees</span>
            {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
          </div>
        </QueryBoundary>
      </div>

      {modalOpen && (
        <EmployeeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} employee={editingEmployee} />
      )}
    </div>
  );
}

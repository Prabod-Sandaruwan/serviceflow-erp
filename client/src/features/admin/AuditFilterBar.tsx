import { Filter } from 'lucide-react';

interface AuditFilterBarProps {
  from: string; onFromChange: (v: string) => void;
  to: string; onToChange: (v: string) => void;
  entityType: string; onEntityTypeChange: (v: string) => void;
  action: string; onActionChange: (v: string) => void;
  onFilter: () => void; onReset: () => void;
}

const ENTITIES = [
  { value: '', label: 'All Entities' }, { value: 'USER', label: 'User' },
  { value: 'CLIENT', label: 'Client' }, { value: 'INVOICE', label: 'Invoice' },
  { value: 'PROJECT', label: 'Project' }, { value: 'LEAD', label: 'Lead' },
  { value: 'QUOTATION', label: 'Quotation' }, { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'SYSTEM', label: 'System' },
];

const ACTIONS = [
  { value: '', label: 'All Actions' }, { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' }, { value: 'USER_CREATED', label: 'User Created' },
  { value: 'ROLE_CHANGED', label: 'Role Changed' }, { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'CLIENT_CREATED', label: 'Client Created' }, { value: 'CLIENT_UPDATED', label: 'Client Updated' },
  { value: 'LEAD_CREATED', label: 'Lead Created' }, { value: 'LEAD_CONVERTED', label: 'Lead Converted' },
  { value: 'CREATE', label: 'Create' }, { value: 'UPDATE', label: 'Update' }, { value: 'DELETE', label: 'Delete' },
];

export function AuditFilterBar({
  from, onFromChange, to, onToChange, entityType, onEntityTypeChange,
  action, onActionChange, onFilter, onReset,
}: AuditFilterBarProps) {
  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <form onSubmit={(e) => { e.preventDefault(); onFilter(); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label htmlFor="from-date" className="block text-xs font-semibold text-slate-700 mb-1.5">Date From</label>
          <input id="from-date" type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label htmlFor="to-date" className="block text-xs font-semibold text-slate-700 mb-1.5">Date To</label>
          <input id="to-date" type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label htmlFor="entity-type" className="block text-xs font-semibold text-slate-700 mb-1.5">Entity Type</label>
          <select id="entity-type" value={entityType} onChange={(e) => onEntityTypeChange(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 text-slate-700 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20">
            {ENTITIES.map((e) => (<option key={e.value} value={e.value}>{e.label}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="action-type" className="block text-xs font-semibold text-slate-700 mb-1.5">Action</label>
          <select id="action-type" value={action} onChange={(e) => onActionChange(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 text-slate-700 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20">
            {ACTIONS.map((a) => (<option key={a.value} value={a.value}>{a.label}</option>))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /><span>Filter</span>
          </button>
          <button type="button" onClick={onReset} className="py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-colors">
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default AuditFilterBar;

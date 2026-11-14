import type { Column } from '../../components/ui/Table';
import { EmployeeActionMenu } from './EmployeeActionMenu';

const AVATAR_PALETTE = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-rose-100 text-rose-700 border-rose-200',
];

function getInitials(name?: string): string {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name?: string): string {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function getEmployeeColumns(onEdit: (e: any) => void): Column<any>[] {
  return [
    {
      key: 'fullName',
      label: 'FULL NAME',
      render: (e: any) => {
        const name = e.fullName || e.full_name || 'Unnamed Employee';
        const initials = getInitials(name);
        const color = getAvatarColor(name);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${color}`}>
              {initials}
            </div>
            <span className="font-semibold text-slate-900 text-xs sm:text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      key: 'email',
      label: 'EMAIL',
      render: (e: any) => <span className="text-xs text-slate-600">{e.email || '-'}</span>,
    },
    {
      key: 'jobTitle',
      label: 'JOB TITLE',
      render: (e: any) => <span className="text-xs font-medium text-slate-700">{e.jobTitle || e.job_title || '-'}</span>,
    },
    {
      key: 'isActive',
      label: 'STATUS',
      render: (e: any) => {
        const active = e.isActive !== false;
        return active ? (
          <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        ) : (
          <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (e: any) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(e)}
            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
          >
            Edit
          </button>
          <EmployeeActionMenu employee={e} onEdit={onEdit} />
        </div>
      ),
    },
  ];
}

export default getEmployeeColumns;


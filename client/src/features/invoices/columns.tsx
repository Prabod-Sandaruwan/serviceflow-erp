import { Link } from 'react-router-dom';
import type { Column } from '../../components/ui/Table';
import { InvoiceActionMenu } from './InvoiceActionMenu';
import type { Invoice } from './types';

const fmt = (v?: string | number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  PAID: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PARTIALLY_PAID: { label: 'Partially Paid', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  ISSUED: { label: 'Issued', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  DRAFT: { label: 'Draft', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export function getInvoiceColumns(onRecordPayment?: (i: Invoice) => void, onIssue?: (i: Invoice) => void): Column<Invoice>[] {
  return [
    {
      key: 'invoiceNumber',
      label: 'INVOICE NUMBER',
      render: (inv) => (
        <Link to={`/invoices/${inv.id}`} className="font-semibold text-blue-600 hover:text-blue-700 font-mono text-xs">
          {inv.invoiceNumber}
        </Link>
      ),
    },
    {
      key: 'projectClient',
      label: 'PROJECT / CLIENT',
      render: (inv) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{inv.project?.name || (inv.projectId ? `Project #${inv.projectId}` : '-')}</div>
          <div className="text-[11px] text-slate-500">{inv.project?.client?.displayName || '-'}</div>
        </div>
      ),
    },
    { key: 'issueDate', label: 'ISSUE DATE', render: (inv) => <span className="text-xs text-slate-600 font-mono">{inv.issueDate || '-'}</span> },
    {
      key: 'dueDate',
      label: 'DUE DATE',
      render: (inv) => (
        <span className={`text-xs font-mono ${inv.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>{inv.dueDate || '-'}</span>
      ),
    },
    { key: 'total', label: 'TOTAL', render: (inv) => <span className="font-bold text-slate-900 text-xs">{fmt(inv.total)}</span> },
    {
      key: 'balance',
      label: 'BALANCE',
      render: (inv) => (
        <span className={`font-bold text-xs ${inv.isOverdue && Number(inv.balance) > 0 ? 'text-rose-600' : 'text-slate-700'}`}>{fmt(inv.balance)}</span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (inv) => {
        const conf = STATUS_BADGES[inv.status] || { label: inv.status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
        return (
          <div className="flex flex-col items-start gap-1">
            <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${conf.cls}`}>{conf.label}</span>
            {inv.isOverdue && (
              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200" data-testid="overdue-badge">
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (inv) => (
        <div className="flex items-center gap-1">
          <Link to={`/invoices/${inv.id}`} className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition">
            View
          </Link>
          <InvoiceActionMenu invoice={inv} onRecordPayment={onRecordPayment} onIssue={onIssue} />
        </div>
      ),
    },
  ];
}

export const invoiceColumns = getInvoiceColumns();
export default invoiceColumns;

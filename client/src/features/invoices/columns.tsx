import { Link } from 'react-router-dom';
import type { Column } from '../../components/ui/Table';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import type { Invoice } from './types';

const fmt = (val?: string | number) =>
  `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const invoiceColumns: Column<Invoice>[] = [
  {
    key: 'invoiceNumber',
    label: 'Invoice Number',
    render: (inv) => (
      <Link
        to={`/invoices/${inv.id}`}
        style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', fontFamily: 'monospace' }}
      >
        {inv.invoiceNumber}
      </Link>
    ),
  },
  {
    key: 'projectClient',
    label: 'Project / Client',
    render: (inv) => (
      <div>
        <div style={{ fontWeight: 500 }}>{inv.project?.name || (inv.projectId ? `Project #${inv.projectId}` : '-')}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.project?.client?.displayName || '-'}</div>
      </div>
    ),
  },
  {
    key: 'issueDate',
    label: 'Issue Date',
    render: (inv) => inv.issueDate || '-',
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    render: (inv) => inv.dueDate || '-',
  },
  {
    key: 'total',
    label: 'Total',
    render: (inv) => <span style={{ fontWeight: 600 }}>{fmt(inv.total)}</span>,
  },
  {
    key: 'balance',
    label: 'Balance',
    render: (inv) => <span style={{ fontWeight: 600 }}>{fmt(inv.balance)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (inv) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <StatusBadge status={inv.status} />
        {inv.isOverdue && (
          <Badge variant="danger" style={{ fontWeight: 700 }} data-testid="overdue-badge">
            Overdue
          </Badge>
        )}
      </div>
    ),
  },
];

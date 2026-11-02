import { Link } from 'react-router-dom';
import type { Column } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Quotation } from './types';

export const quotationColumns: Column<Quotation>[] = [
  {
    key: 'quotationNumber',
    label: 'Quotation Number',
    render: (q) => (
      <Link to={`/quotations/${q.id}`} style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', fontFamily: 'monospace' }}>
        {q.quotationNumber}
      </Link>
    ),
  },
  { key: 'clientName', label: 'Client', render: (q) => q.clientName || (q.clientId ? `Client #${q.clientId}` : '-') },
  { key: 'title', label: 'Title', render: (q) => q.title || '-' },
  { key: 'total', label: 'Total', render: (q) => `$${Number(q.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  {
    key: 'status',
    label: 'Status',
    render: (q) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <StatusBadge status={q.status} />
        {q.isExpired && (
          <span
            data-testid="expired-badge"
            style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#991b1b' }}
          >
            Expired
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (q) => (
      <Link to={`/quotations/${q.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600, padding: '0.25rem 0.65rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.8rem' }}>
        View
      </Link>
    ),
  },
];

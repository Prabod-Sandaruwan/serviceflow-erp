import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Column } from '../../components/ui/Table';
import type { Project } from './types';

export const projectColumns: Column<Project>[] = [
  {
    key: 'projectCode',
    label: 'Project Code',
    render: (row) => (
      <Link
        to={`/projects/${row.id}`}
        style={{ fontWeight: 600, color: '#4f46e5', textDecoration: 'none' }}
      >
        {row.projectCode}
      </Link>
    ),
  },
  {
    key: 'name',
    label: 'Name',
    render: (row) => <span style={{ fontWeight: 500 }}>{row.name}</span>,
  },
  {
    key: 'client',
    label: 'Client',
    render: (row) => <span>{row.client?.displayName || '-'}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'progressPercent',
    label: 'Progress',
    render: (row) => {
      const pct = Math.min(100, Math.max(0, row.progressPercent ?? 0));
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '60px',
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: pct === 100 ? '#16a34a' : '#4f46e5',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            {pct}%
          </span>
        </div>
      );
    },
  },
];


import type { ReactNode } from 'react';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data?: T[];
  isLoading?: boolean;
  isError?: boolean;
  emptyText?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data = [],
  isLoading,
  isError,
  emptyText = 'No data available',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Spinner size="md" label="Loading data..." />
      </div>
    );
  }
  if (isError) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', background: '#fff', borderRadius: '8px' }}>Failed to load data.</div>;
  }
  if (!data || data.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px' }}>{emptyText}</div>;
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem', color: '#0f172a' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#334155' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {columns.map((col) => (
                <td key={String(col.key)} style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

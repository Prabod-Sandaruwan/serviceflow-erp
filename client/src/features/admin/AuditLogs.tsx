import React, { useState } from 'react';
import { useAuditLogs } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Pagination } from '../../components/ui/Pagination';
import { Input, Select, Button } from '../../components/ui/Forms';

const ENTITIES = [{ value: '', label: 'All Entities' }, { value: 'USER', label: 'User' }, { value: 'EMPLOYEE', label: 'Employee' }, { value: 'LEAD', label: 'Lead' }, { value: 'QUOTATION', label: 'Quotation' }, { value: 'PROJECT', label: 'Project' }, { value: 'INVOICE', label: 'Invoice' }];
const ACTIONS = [{ value: '', label: 'All Actions' }, { value: 'LOGIN', label: 'Login' }, { value: 'LOGOUT', label: 'Logout' }, { value: 'USER_CREATED', label: 'User Created' }, { value: 'ROLE_CHANGED', label: 'Role Changed' }, { value: 'PASSWORD_RESET', label: 'Password Reset' }, { value: 'EMPLOYEE_CREATED', label: 'Employee Created' }];

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);

  const query = useAuditLogs({ page, limit: 20, entityType, action, from, to });
  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;
  const update = (fn: (v: string) => void) => (e: any) => { fn(e.target.value); setPage(1); };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>Audit Logs</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Immutable record of administrative, user, and financial operations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <Input id="from-date" label="Date From" type="date" value={from} onChange={update(setFrom)} />
        <Input id="to-date" label="Date To" type="date" value={to} onChange={update(setTo)} />
        <Select id="entity-type" label="Entity Type" options={ENTITIES} value={entityType} onChange={update(setEntityType)} />
        <Select id="action-type" label="Action" options={ACTIONS} value={action} onChange={update(setAction)} />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', overflowX: 'auto' }}>
        <QueryBoundary query={query} emptyMessage="No audit logs found.">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                {['ID', 'Date', 'Actor', 'Action', 'Entity', 'Details'].map((h) => <th key={h} style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((log: any) => (
                <React.Fragment key={log.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.id}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{log.createdAt || log.date ? new Date(log.createdAt || log.date).toLocaleString() : '-'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.actor?.email || log.actorRole || log.actorUserId || 'System'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#334155' }}>{log.action}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Button variant="secondary" onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        Details
                      </Button>
                    </td>
                  </tr>
                  {expandedRow === log.id && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={6} style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        <pre style={{ margin: 0, fontSize: '0.75rem', overflowX: 'auto', background: '#0f172a', color: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                          {JSON.stringify({ before: log.before ?? log.beforeJson, after: log.after ?? log.afterJson }, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
        </QueryBoundary>
      </div>
    </div>
  );
}

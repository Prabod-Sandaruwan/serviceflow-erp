import { useSearchParams } from 'react-router-dom';
import { useInvoices } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Select, Input } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { invoiceColumns } from './columns';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const clientId = searchParams.get('clientId') || '';
  const projectId = searchParams.get('projectId') || '';
  const overdue = searchParams.get('overdue') === 'true';
  const page = searchParams.get('page') || '1';

  const updateFilter = (key: string, val: string | boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === '' || val === false) next.delete(key);
      else next.set(key, String(val));
      next.set('page', '1');
      return next;
    });
  };

  const query = useInvoices({
    status: status || undefined,
    clientId: clientId || undefined,
    projectId: projectId || undefined,
    overdue: overdue ? true : undefined,
    page,
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Invoices</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          Manage billing, monitor payment status, and track overdue accounts
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.25rem', background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ minWidth: '160px' }}>
          <Select id="status-filter" label="Status" value={status} onChange={(e) => updateFilter('status', e.target.value)} options={STATUS_OPTIONS} />
        </div>
        <div style={{ width: '130px' }}>
          <Input id="client-filter" label="Client ID" placeholder="Client ID" value={clientId} onChange={(e) => updateFilter('clientId', e.target.value)} />
        </div>
        <div style={{ width: '130px' }}>
          <Input id="project-filter" label="Project ID" placeholder="Project ID" value={projectId} onChange={(e) => updateFilter('projectId', e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
          <input type="checkbox" checked={overdue} onChange={(e) => updateFilter('overdue', e.target.checked)} />
          Overdue only
        </label>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No invoices found">
          <Table columns={invoiceColumns} data={query.data?.data} />
          <Pagination
            page={Number(page)}
            totalPages={query.data?.meta?.totalPages || 1}
            onPageChange={(p) => updateFilter('page', String(p))}
          />
        </QueryBoundary>
      </div>
    </div>
  );
}

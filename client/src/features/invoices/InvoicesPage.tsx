import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { useInvoices, useIssueInvoice } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { getInvoiceColumns } from './columns';
import { InvoiceStats } from './InvoiceStats';
import { InvoiceFilterBar } from './InvoiceFilterBar';
import { downloadAllInvoicesCsv } from './exportInvoices';
import { PaymentDialog } from './PaymentDialog';
import { IssueDialog } from './IssueDialog';
import type { Invoice } from './types';

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const clientId = searchParams.get('clientId') || '';
  const projectId = searchParams.get('projectId') || '';
  const overdue = searchParams.get('overdue') === 'true';
  const page = searchParams.get('page') || '1';

  const [payingInv, setPayingInv] = useState<Invoice | null>(null);
  const [issuingInv, setIssuingInv] = useState<Invoice | null>(null);
  const issueMutation = useIssueInvoice();

  const updateFilter = (key: string, val: string | boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === '' || val === false) next.delete(key); else next.set(key, String(val));
      next.set('page', '1');
      return next;
    });
  };

  const query = useInvoices({ status: status || undefined, clientId: clientId || undefined, projectId: projectId || undefined, overdue: overdue ? true : undefined, page });
  const data = query.data?.data || [];
  const meta = query.data?.meta;
  const total = meta?.total ?? data.length;

  const columns = getInvoiceColumns((i) => setPayingInv(i), (i) => setIssuingInv(i));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">Manage billing, monitor payment status, and track overdue accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => downloadAllInvoicesCsv(data)} className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition">
            <Download className="w-3.5 h-3.5 text-slate-400" /><span>Export CSV</span>
          </button>
          <Link to="/invoices/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition">
            <Plus className="w-4 h-4" /><span>+ Create Invoice</span>
          </Link>
        </div>
      </section>

      <InvoiceStats invoices={data} />
      <InvoiceFilterBar status={status} onStatusChange={(v) => updateFilter('status', v)} clientId={clientId} onClientIdChange={(v) => updateFilter('clientId', v)} projectId={projectId} onProjectIdChange={(v) => updateFilter('projectId', v)} overdue={overdue} onOverdueChange={(v) => updateFilter('overdue', v)} onRefresh={() => query.refetch()} />

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No invoices found">
          <Table columns={columns} data={data} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-4 mt-2 border-t border-slate-100">
            <span>Showing {data.length} of {total} total invoices</span>
            <Pagination page={Number(page)} totalPages={meta?.totalPages || 1} onPageChange={(p) => updateFilter('page', String(p))} />
          </div>
        </QueryBoundary>
      </div>

      {payingInv && (
        <PaymentDialog isOpen={Boolean(payingInv)} onClose={() => setPayingInv(null)} invoiceId={payingInv.id} balance={payingInv.balance} />
      )}
      {issuingInv && (
        <IssueDialog isOpen={Boolean(issuingInv)} onClose={() => setIssuingInv(null)} onConfirm={async (d) => { await issueMutation.mutateAsync({ id: issuingInv.id, ...d }); setIssuingInv(null); }} />
      )}
    </div>
  );
}

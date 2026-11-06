import type { Invoice } from './types';

const fmt = (v?: string | number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function InvoiceSections({ invoice }: { invoice: Invoice }) {
  const { items = [], project } = invoice;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
        <div><strong style={{ color: '#64748b' }}>Client:</strong> <div>{project?.client?.displayName || '-'}</div></div>
        <div><strong style={{ color: '#64748b' }}>Project:</strong> <div>{project?.name || (invoice.projectId ? `Project #${invoice.projectId}` : '-')}</div></div>
        <div><strong style={{ color: '#64748b' }}>Issue Date:</strong> <div>{invoice.issueDate || '-'}</div></div>
        <div><strong style={{ color: '#64748b' }}>Due Date:</strong> <div>{invoice.dueDate || '-'}</div></div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>Items</h3>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.65rem 1rem' }}>Description</th>
                <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={2} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No items</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 1rem' }}>{it.description}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>{fmt(it.lineAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>{fmt(invoice.subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax:</span><span>{fmt(invoice.taxAmount)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #cbd5e1', paddingTop: '0.35rem' }}><span>Total:</span><span>{fmt(invoice.total)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a' }}><span>Balance:</span><span>{fmt(invoice.balance)}</span></div>
        </div>
      </div>

      {(invoice.issuedAt || invoice.cancelledAt || invoice.cancelReason) && (
        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
          <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Status Timeline</strong>
          {invoice.issuedAt && <div>Issued at: {new Date(invoice.issuedAt).toLocaleString()}</div>}
          {invoice.cancelledAt && <div style={{ color: '#991b1b' }}>Cancelled at: {new Date(invoice.cancelledAt).toLocaleString()}</div>}
          {invoice.cancelReason && <div style={{ color: '#991b1b' }}>Reason: {invoice.cancelReason}</div>}
        </div>
      )}
    </div>
  );
}
export default InvoiceSections;

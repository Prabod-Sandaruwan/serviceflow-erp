import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, CreditCard, Send, Download } from 'lucide-react';
import { downloadInvoicePdf } from './hooks';
import type { Invoice } from './types';

interface InvoiceActionMenuProps {
  invoice: Invoice;
  onRecordPayment?: (inv: Invoice) => void;
  onIssue?: (inv: Invoice) => void;
}

export function InvoiceActionMenu({ invoice, onRecordPayment, onIssue }: InvoiceActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const canPay = invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID';
  const canIssue = invoice.status === 'DRAFT';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        title="More actions"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-lg border border-slate-200/80 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <Link
            to={`/invoices/${invoice.id}`}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </Link>
          {canPay && onRecordPayment && (
            <button
              type="button"
              onClick={() => { setOpen(false); onRecordPayment(invoice); }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Record Payment</span>
            </button>
          )}
          {canIssue && onIssue && (
            <button
              type="button"
              onClick={() => { setOpen(false); onIssue(invoice); }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Issue Invoice</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); downloadInvoicePdf(invoice.id, `Invoice-${invoice.invoiceNumber}.pdf`); }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default InvoiceActionMenu;


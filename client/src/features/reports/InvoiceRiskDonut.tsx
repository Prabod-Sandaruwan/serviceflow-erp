import { useState } from 'react';
import { Mail, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import type { DashboardFinancials } from './types';

export function InvoiceRiskDonut({ f }: { f?: DashboardFinancials | null }) {
  const { addToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const col = parseFloat(f?.paymentsReceived ?? '0') || 0;
  const out = parseFloat(f?.outstanding ?? '0') || 0;
  const risk = parseFloat(f?.overdueOutstanding ?? '0') || 0;
  const total = parseFloat(f?.revenue ?? '0') || col + out + risk;
  const overdueCount = f?.overdueCount ?? 0;

  const riskPct = total > 0 ? ((risk / total) * 100).toFixed(1) : '0.0';
  const colPct = total > 0 ? ((col / total) * 100).toFixed(1) : '0.0';
  const c = 301.6;
  const colDash = total > 0 ? c * (1 - Math.min(1, col / total)) : c;
  const riskDash = total > 0 ? c * (1 - Math.min(1, risk / total)) : c;

  const handleSend = async () => {
    if (overdueCount === 0) {
      addToast('All client accounts are in good standing.', 'info');
      return;
    }
    setIsSending(true);
    try {
      const res = await api.post<{ data: { dispatchedCount: number; totalOverdue: string } }>('/invoices/dunning-notices');
      addToast(`Dispatched dunning reminders for ${res.data?.dispatchedCount ?? overdueCount} invoices ($${res.data?.totalOverdue ?? risk.toFixed(2)})`, 'success');
    } catch {
      addToast('Failed to dispatch dunning notices', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Invoice Balance &amp; Risk Exposure</h3>
          <ShieldAlert className="h-4 w-4 text-slate-400" />
        </div>
        <p className="mt-1 text-xs text-slate-500">Aging &amp; portfolio recovery index</p>

        <div className="relative my-4 flex items-center justify-center">
          <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" stroke="#f1f5f9" strokeWidth="12" fill="none" />
            <circle cx="60" cy="60" r="48" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray={c} strokeDashoffset={colDash} strokeLinecap="round" />
            <circle cx="60" cy="60" r="48" stroke="#f43f5e" strokeWidth="12" fill="none" strokeDasharray={c} strokeDashoffset={riskDash} strokeLinecap="round" />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Booked</span>
            <span className="text-lg font-black text-slate-900 tracking-tight">${Math.round(total).toLocaleString()}</span>
            <span className="mt-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">{riskPct}% Aging Risk</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Collected Cash</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800">${col.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="ml-1 text-[10px] text-slate-400">{colPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-slate-600 font-medium">Current Outstanding</span>
            </div>
            <div className="text-right font-bold text-slate-800">${out.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-rose-600 font-medium">Overdue Backlog</span>
            </div>
            <div className="text-right font-bold text-rose-600">${risk.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <button type="button" onClick={handleSend} disabled={isSending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/40 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50">
        {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
        {isSending ? 'Dispatching...' : 'Send Overdue Dunning Notices'}
      </button>
    </div>
  );
}

export default InvoiceRiskDonut;

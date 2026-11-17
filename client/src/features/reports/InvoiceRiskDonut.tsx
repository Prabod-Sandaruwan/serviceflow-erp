import { useState } from "react";
import { Mail, ShieldAlert, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import type { DashboardFinancials } from "./types";
import { DonutSvg } from "./DonutSvg";
import { InvoiceRiskBreakdown } from "./InvoiceRiskBreakdown";

export function InvoiceRiskDonut({ f }: { f?: DashboardFinancials | null }) {
  const { addToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const col = parseFloat(f?.paymentsReceived ?? "0") || 0;
  const out = parseFloat(f?.outstanding ?? "0") || 0;
  const risk = parseFloat(f?.overdueOutstanding ?? "0") || 0;
  const total = parseFloat(f?.revenue ?? "0") || col + out + risk;
  const overdueCount = f?.overdueCount ?? 0;

  const riskPct = total > 0 ? ((risk / total) * 100).toFixed(1) : "0.0";
  const colPct = total > 0 ? ((col / total) * 100).toFixed(1) : "0.0";

  const c = 301.6;
  const colLen = total > 0 ? (col / total) * c : 0;
  const outLen = total > 0 ? (out / total) * c : 0;
  const riskLen = total > 0 ? (risk / total) * c : 0;

  const handleSend = async () => {
    if (overdueCount === 0) {
      addToast("All client accounts are in good standing.", "info");
      return;
    }
    setIsSending(true);
    try {
      const res = await api.post<{
        data: { dispatchedCount: number; totalOverdue: string };
      }>("/invoices/dunning-notices");
      addToast(
        `Dispatched dunning reminders for ${res.data?.dispatchedCount ?? overdueCount} invoices ($${res.data?.totalOverdue ?? risk.toFixed(2)})`,
        "success",
      );
    } catch {
      addToast("Failed to dispatch dunning notices", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Invoice Balance &amp; Risk Exposure
          </h3>
          <ShieldAlert className="h-4 w-4 text-slate-400" />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Aging &amp; portfolio recovery index
        </p>
        <DonutSvg
          colLen={colLen}
          outLen={outLen}
          riskLen={riskLen}
          total={total}
          riskPct={riskPct}
        />
        <InvoiceRiskBreakdown col={col} colPct={colPct} out={out} risk={risk} />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/40 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
      >
        {isSending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        {isSending ? "Dispatching..." : "Send Overdue Dunning Notices"}
      </button>
    </div>
  );
}

export default InvoiceRiskDonut;

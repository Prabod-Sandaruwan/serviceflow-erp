import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD';
  paymentDate: string;
  reference?: string | null;
  note?: string | null;
  status: 'ACTIVE' | 'VOIDED';
  recordedBy?: string | null;
  voidedBy?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  createdAt: string;
}

export interface RecordPaymentPayload {
  amount: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD';
  date: string;
  reference?: string;
  note?: string;
}

export function useInvoicePayments(invoiceId?: string) {
  return useQuery<{ data: PaymentRecord[] }>({
    queryKey: ['payments', invoiceId],
    queryFn: () => api.get<{ data: PaymentRecord[] }>(`/invoices/${invoiceId}/payments`),
    enabled: Boolean(invoiceId),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: RecordPaymentPayload }) => {
      const idemKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return api.post<{ data: PaymentRecord; meta: { newBalance: string; invoiceStatus: string } }>(
        `/invoices/${invoiceId}/payments`,
        data,
        { headers: { 'Idempotency-Key': idemKey } }
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', vars.invoiceId] });
      qc.invalidateQueries({ queryKey: ['payments', vars.invoiceId] });
    },
  });
}

export function useVoidPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; invoiceId?: string; reason: string }) =>
      api.post<{ data: PaymentRecord }>(`/payments/${paymentId}/void`, { reason }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      if (vars.invoiceId) {
        qc.invalidateQueries({ queryKey: ['invoices', vars.invoiceId] });
        qc.invalidateQueries({ queryKey: ['payments', vars.invoiceId] });
      }
    },
  });
}

import { ApiError } from '../../shared/errors';

export function assertEditable(invoice: { status: string }): void {
  if (invoice.status !== 'DRAFT') {
    throw new ApiError(409, 'INVOICE_IMMUTABLE', 'Only draft invoices can be modified or issued');
  }
}

export function assertCancellable(invoice: { status: string }): void {
  if (invoice.status === 'PARTIALLY_PAID' || invoice.status === 'PAID') {
    throw new ApiError(409, 'INVOICE_HAS_PAYMENTS', 'Cannot cancel a partially paid or paid invoice');
  }
  if (invoice.status === 'CANCELLED') {
    throw new ApiError(409, 'ALREADY_CANCELLED', 'Invoice is already cancelled');
  }
}

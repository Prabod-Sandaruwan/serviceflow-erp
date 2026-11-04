import { ApiError } from '../../shared/errors';

export function assertEditable(invoice: { status: string }): void {
  if (invoice.status !== 'DRAFT') {
    throw new ApiError(409, 'INVOICE_IMMUTABLE', 'Only draft invoices can be modified or issued');
  }
}

import { ApiError } from '../../shared/errors';
import prisma from '../../config/prisma';
import { ListInvoicesQuery } from './invoices.schemas';
import { formatInvoice } from './invoices.formatter';
import { findMany, findById } from './invoices.repository';
import { Actor } from './invoices.create';

export async function getInvoices(query: ListInvoicesQuery, actor?: Actor) {
  let actorEmployeeId: bigint | undefined;
  if (actor?.role === 'STAFF') {
    actorEmployeeId = (actor as any).employeeId != null ? BigInt((actor as any).employeeId) : -1n;
  }
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? (query as any).limit ?? 20;

  const [items, total] = await findMany(
    {
      status: query.status,
      clientId: query.clientId != null ? String(query.clientId) : undefined,
      projectId: query.projectId != null ? String(query.projectId) : undefined,
      overdue: query.overdue,
      from: query.from,
      to: query.to,
    },
    { skip: (page - 1) * pageSize, take: pageSize },
    actorEmployeeId
  );

  return { data: items.map(formatInvoice), meta: { page, pageSize, total } };
}

export async function getInvoiceById(id: string | bigint | number, actor?: Actor) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
  }

  let actorEmployeeId: bigint | undefined;
  if (actor?.role === 'STAFF') {
    actorEmployeeId = (actor as any).employeeId != null ? BigInt((actor as any).employeeId) : -1n;
  }

  const existing = await prisma.invoice.findUnique({ where: { id: rawId } });
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');

  const invoice = await findById(rawId, actorEmployeeId);
  if (!invoice) throw new ApiError(403, 'FORBIDDEN', 'Access to this invoice is restricted');

  return formatInvoice(invoice);
}

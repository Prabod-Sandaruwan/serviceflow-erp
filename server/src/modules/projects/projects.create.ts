import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { CreateProjectInput } from './projects.schemas';
import { formatProject } from './projects.formatter';

export interface ProjectServiceContext {
  ip?: string;
  requestId?: string;
}

type Actor = { userId?: bigint | string; role?: string };

export async function createProject(
  data: CreateProjectInput,
  actor?: Actor,
  ctx?: ProjectServiceContext
) {
  let rawQuotId: bigint;
  try {
    rawQuotId = BigInt(data.quotationId);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
  }

  const creatorId = actor?.userId ? BigInt(actor.userId) : BigInt(1);

  return runInTransaction(async (tx) => {
    const rows = await tx.$queryRaw<any[]>`
      SELECT id, status, client_id, title, subtotal FROM quotations WHERE id = ${rawQuotId} FOR UPDATE
    `;
    const quotation = rows?.[0];
    if (!quotation) {
      throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
    }

    if (quotation.status !== 'ACCEPTED') {
      throw new ApiError(409, 'QUOTATION_NOT_ACCEPTED', 'Quotation is not in ACCEPTED status');
    }

    const existingProject = await tx.project.findUnique({ where: { quotationId: rawQuotId } });
    if (existingProject) {
      throw new ApiError(
        409,
        'PROJECT_ALREADY_EXISTS',
        'A project already exists for this quotation.'
      );
    }

    let project: any;
    try {
      project = await tx.project.create({
        data: {
          projectCode: `TMP-${Math.random().toString(36).slice(2, 10)}`,
          quotationId: rawQuotId,
          clientId: quotation.client_id,
          name: data.name?.trim() || quotation.title,
          budgetAmount: quotation.subtotal,
          status: 'PLANNED',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          createdBy: creatorId,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ApiError(
          409,
          'PROJECT_ALREADY_EXISTS',
          'A project already exists for this quotation.'
        );
      }
      throw err;
    }

    const projectCode = `PRJ-${new Date().getFullYear()}-${String(project.id).padStart(4, '0')}`;
    const updated = await tx.project.update({
      where: { id: project.id },
      data: { projectCode },
      include: {
        client: { select: { id: true, display_name: true } },
        quotation: { select: { id: true, quotationNumber: true } },
      },
    });

    const formatted = formatProject(updated);
    await AuditService.record(tx, {
      actor,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project.id,
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return formatted;
  });
}

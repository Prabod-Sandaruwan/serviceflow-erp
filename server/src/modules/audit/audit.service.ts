import { Tx } from '../../shared/tx';
import { toJson } from '../../shared/http';
import { AuditAction } from './actions';
import { ListAuditLogsQuery } from './audit.schemas';
import prisma from '../../config/prisma';

export interface AuditActor {
  userId?: bigint | number | string | null;
  role?: string | null;
}

export interface AuditRecordParams {
  actor?: AuditActor | null;
  actorUserId?: bigint | number | string | null;
  actorRole?: string | null;
  action: AuditAction | string;
  entityType: string;
  entityId?: bigint | number | string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  requestId?: string | null;
  ip?: string | null;
}

const SENSITIVE_REGEX = /^(password|passwordHash|token|secret|authorization|cookie|csrfToken)$/i;

export const sanitizeAuditData = (data: any): any => {
  if (data === null || data === undefined) return data;
  const serialized = toJson(data);
  if (Array.isArray(serialized)) return serialized.map((item) => sanitizeAuditData(item));
  if (typeof serialized === 'object' && !(serialized instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(serialized)) {
      if (!SENSITIVE_REGEX.test(key)) cleaned[key] = sanitizeAuditData(value);
    }
    return cleaned;
  }
  return serialized;
};

export class AuditService {
  static async record(tx: Tx, entry: AuditRecordParams): Promise<void> {
    const actorId = entry.actor?.userId ?? entry.actorUserId;
    const actorRole = entry.actor?.role ?? entry.actorRole ?? null;
    await tx.auditLog.create({
      data: {
        actorUserId: actorId ? BigInt(actorId) : null,
        actorRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId != null ? BigInt(entry.entityId) : null,
        beforeJson: entry.before ? sanitizeAuditData(entry.before) : undefined,
        afterJson: entry.after ? sanitizeAuditData(entry.after) : undefined,
        requestId: entry.requestId ?? null,
        ipAddress: entry.ip ?? null,
      },
    });
  }

  static async log(entry: AuditRecordParams): Promise<void> {
    await AuditService.record(prisma as any, entry);
  }

  static async listLogs(query: ListAuditLogsQuery) {
    const page = query.page || 1,
      limit = query.limit || 20;
    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId !== undefined) where.entityId = query.entityId;
    if (query.actorId !== undefined) where.actorUserId = query.actorId;
    if (query.action) where.action = query.action;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }
    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      data: toJson(logs),
      meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}

export const auditService = AuditService;
export default AuditService;

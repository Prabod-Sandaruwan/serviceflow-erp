import { Tx } from '../../shared/tx';
import { toJson } from '../../shared/http';
import { AuditAction } from './actions';

export interface AuditActor {
  userId?: bigint | number | string | null;
  role?: string | null;
}

export interface AuditRecordParams {
  actor?: AuditActor | null;
  action: AuditAction | string;
  entityType: string;
  entityId?: bigint | number | string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  requestId?: string | null;
  ip?: string | null;
}

const SENSITIVE_REGEX =
  /^(password|passwordHash|token|secret|authorization|cookie|csrfToken)$/i;

export const sanitizeAuditData = (data: any): any => {
  if (data === null || data === undefined) return data;
  const serialized = toJson(data);
  if (Array.isArray(serialized)) {
    return serialized.map((item) => sanitizeAuditData(item));
  }
  if (typeof serialized === 'object' && !(serialized instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(serialized)) {
      if (!SENSITIVE_REGEX.test(key)) {
        cleaned[key] = sanitizeAuditData(value);
      }
    }
    return cleaned;
  }
  return serialized;
};

export class AuditService {
  static async record(tx: Tx, entry: AuditRecordParams): Promise<void> {
    await tx.auditLog.create({
      data: {
        actorUserId: entry.actor?.userId ? BigInt(entry.actor.userId) : null,
        actorRole: entry.actor?.role ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId:
          entry.entityId !== undefined && entry.entityId !== null
            ? BigInt(entry.entityId)
            : null,
        beforeJson: entry.before ? sanitizeAuditData(entry.before) : undefined,
        afterJson: entry.after ? sanitizeAuditData(entry.after) : undefined,
        requestId: entry.requestId ?? null,
        ipAddress: entry.ip ?? null,
      },
    });
  }
}

export default AuditService;

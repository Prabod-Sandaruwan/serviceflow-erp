import { CreateUserInput, ListUsersQuery, UpdateUserInput } from './users.schemas';
import { UserRepository } from './users.repository';
import { hashPassword } from '../auth/password';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { AppError } from '../../shared/errors';
import { toJson } from '../../shared/http';
import { purgeUserSessions } from '../auth/sessionCleanup';

type Actor = { userId?: bigint | string; role?: string };

export class UsersService {
  static async createUser(input: CreateUserInput, actor?: Actor, ip?: string, reqId?: string) {
    return runInTransaction(async (tx) => {
      const existing = await UserRepository.findByEmailWithTx(tx, input.email);
      if (existing) throw new AppError('Email already registered', 'VALIDATION_ERROR', 409);
      let employeeId = input.employeeId ? BigInt(input.employeeId) : null;
      if (employeeId && !(await tx.employee.findUnique({ where: { id: employeeId } }))) {
        throw new AppError('Employee not found', 'VALIDATION_ERROR', 422);
      } else if (!employeeId) {
        const emp = await tx.employee.create({
          data: { full_name: input.fullName || input.email.split('@')[0] },
        });
        employeeId = emp.id;
      }
      const pHash = await hashPassword(input.password);
      const user = await tx.user.create({
        data: {
          email: input.email,
          password_hash: pHash,
          role: input.role,
          employeeId,
          must_change_password: true,
          is_active: true,
        },
        include: { employee: true },
      });
      const { password_hash: _, ...profile } = user as any;
      await AuditService.record(tx, {
        actor,
        action: AUDIT_ACTIONS.USER_CREATED,
        entityType: 'USER',
        entityId: user.id,
        after: profile,
        ip,
        requestId: reqId,
      });
      return toJson(profile);
    });
  }

  static async listUsers(query: ListUsersQuery) {
    const page = query.page || 1,
      limit = query.limit || 20;
    const { total, users } = await UserRepository.list(query, (page - 1) * limit, limit);
    return {
      data: toJson(users),
      meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  static async updateUser(
    id: bigint,
    input: UpdateUserInput,
    actor?: Actor,
    ip?: string,
    reqId?: string
  ) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError('User not found', 'NOT_FOUND', 404);
    if (
      actor?.userId &&
      BigInt(id) === BigInt(actor.userId) &&
      (input.role !== undefined || input.isActive !== undefined)
    ) {
      throw new AppError(
        'Self-modification of role or active status is forbidden',
        'SELF_MODIFICATION_FORBIDDEN',
        409
      );
    }
    if (
      user.role === 'ADMIN' &&
      ((input.role && input.role !== 'ADMIN') || input.isActive === false)
    ) {
      if ((await UserRepository.countActiveAdmins()) <= 1) {
        throw new AppError('Cannot demote or deactivate the last active ADMIN', 'CONFLICT', 409);
      }
    }
    const updated = await runInTransaction(async (tx) => {
      const data: any = {};
      if (input.role !== undefined) data.role = input.role;
      if (input.isActive !== undefined) data.is_active = input.isActive;
      const res = await tx.user.update({ where: { id }, data, include: { employee: true } });
      if (input.role && input.role !== user.role) {
        await AuditService.record(tx, {
          actor,
          action: AUDIT_ACTIONS.ROLE_CHANGED,
          entityType: 'USER',
          entityId: id,
          before: { role: user.role },
          after: { role: res.role },
          ip,
          requestId: reqId,
        });
      }
      if (input.isActive === false && user.is_active) {
        await AuditService.record(tx, {
          actor,
          action: AUDIT_ACTIONS.USER_DEACTIVATED,
          entityType: 'USER',
          entityId: id,
          before: { isActive: user.is_active },
          after: { isActive: res.is_active },
          ip,
          requestId: reqId,
        });
      }
      return res;
    });
    if ((input.role && input.role !== user.role) || input.isActive === false) {
      await purgeUserSessions(id);
    }
    const { password_hash: _, ...profile } = updated as any;
    return toJson(profile);
  }

  static async resetPassword(
    id: bigint,
    tempPassword: string,
    actor?: Actor,
    ip?: string,
    reqId?: string
  ) {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError('User not found', 'NOT_FOUND', 404);
    const pHash = await hashPassword(tempPassword);
    await runInTransaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { password_hash: pHash, must_change_password: true },
      });
      await AuditService.record(tx, {
        actor,
        action: AUDIT_ACTIONS.PASSWORD_RESET,
        entityType: 'USER',
        entityId: id,
        ip,
        requestId: reqId,
      });
    });
    await purgeUserSessions(id);
  }
}

export default UsersService;

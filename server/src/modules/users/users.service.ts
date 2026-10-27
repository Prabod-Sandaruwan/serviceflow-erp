import { CreateUserInput, ListUsersQuery } from './users.schemas';
import { UserRepository } from './users.repository';
import { hashPassword } from '../auth/password';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { AppError } from '../../shared/errors';
import { toJson } from '../../shared/http';

export class UsersService {
  static async createUser(
    input: CreateUserInput,
    actor?: { userId?: bigint | string; role?: string },
    ip?: string,
    requestId?: string
  ) {
    return runInTransaction(async (tx) => {
      const existing = await UserRepository.findByEmailWithTx(tx, input.email);
      if (existing) {
        throw new AppError('Email already registered', 'VALIDATION_ERROR', 409);
      }

      let employeeId: bigint;
      if (input.employeeId) {
        employeeId = BigInt(input.employeeId);
        const emp = await tx.employee.findUnique({ where: { id: employeeId } });
        if (!emp) {
          throw new AppError('Employee not found', 'VALIDATION_ERROR', 422);
        }
      } else {
        const fullName = input.fullName || input.email.split('@')[0];
        const newEmp = await tx.employee.create({ data: { full_name: fullName } });
        employeeId = newEmp.id;
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

      const { password_hash, passwordHash: _, ...profile } = user as any;
      await AuditService.record(tx, {
        actor,
        action: AUDIT_ACTIONS.USER_CREATED,
        entityType: 'USER',
        entityId: user.id,
        afterJson: profile,
        ip,
        requestId,
      });

      return toJson(profile);
    });
  }

  static async listUsers(query: ListUsersQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const { total, users } = await UserRepository.list(query, skip, limit);
    return {
      data: toJson(users),
      meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}

export default UsersService;

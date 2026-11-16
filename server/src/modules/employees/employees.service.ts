import { CreateEmployeeInput, ListEmployeesQuery, UpdateEmployeeInput } from './employees.schemas';
import { EmployeeRepository } from './employees.repository';
import { formatEmployee } from './employees.formatter';
import { syncEmployeeUser } from './employees.user-sync';
import { createEmployeeTx } from './employees.create';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { AppError } from '../../shared/errors';
import { toJson } from '../../shared/http';

type Actor = { userId?: bigint | string; role?: string };

export class EmployeesService {
  static async list(query: ListEmployeesQuery) {
    const page = query.page || 1,
      limit = query.limit || 20;
    const { total, employees } = await EmployeeRepository.list(query, (page - 1) * limit, limit);
    return {
      data: toJson(employees.map(formatEmployee)),
      meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  static async create(input: CreateEmployeeInput, actor?: Actor, ip?: string, reqId?: string) {
    return runInTransaction((tx) => createEmployeeTx(tx, input, actor, ip, reqId));
  }

  static async update(
    id: bigint,
    input: UpdateEmployeeInput,
    actor?: Actor,
    ip?: string,
    reqId?: string
  ) {
    return runInTransaction(async (tx) => {
      const current = await EmployeeRepository.findById(id, tx);
      if (!current) throw new AppError('Employee not found', 'NOT_FOUND', 404);
      await syncEmployeeUser(tx, id, current, input);
      const data: any = {};
      if (input.fullName !== undefined) data.full_name = input.fullName;
      if (input.jobTitle !== undefined) data.job_title = input.jobTitle;
      if (input.department !== undefined) data.department = input.department;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.isActive !== undefined) data.is_active = input.isActive;
      const updated = await tx.employee.update({ where: { id }, data, include: { user: true } });
      if (input.isActive === false && updated.user) {
        await tx.user.update({ where: { id: updated.user.id }, data: { is_active: false } });
      }
      const res = formatEmployee({
        ...updated,
        user: updated.user || (input.email ? { email: input.email } : current.user),
      });
      const action =
        input.isActive === false
          ? AUDIT_ACTIONS.EMPLOYEE_DEACTIVATED
          : AUDIT_ACTIONS.EMPLOYEE_UPDATED;
      await AuditService.record(tx, {
        actor,
        action,
        entityType: 'EMPLOYEE',
        entityId: id,
        before: formatEmployee(current),
        after: res,
        ip,
        requestId: reqId,
      });
      return toJson(res);
    });
  }
}

export default EmployeesService;

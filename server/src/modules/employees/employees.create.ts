import { CreateEmployeeInput } from './employees.schemas';
import { EmployeeRepository } from './employees.repository';
import { formatEmployee } from './employees.formatter';
import { hashPassword } from '../auth/password';
import { Tx } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { AppError } from '../../shared/errors';
import { toJson } from '../../shared/http';

export async function createEmployeeTx(
  tx: Tx,
  input: CreateEmployeeInput,
  actor?: { userId?: bigint | string; role?: string },
  ip?: string,
  reqId?: string
) {
  const existing = await EmployeeRepository.findByEmail(input.email, tx);
  if (existing) throw new AppError('Email already registered', 'VALIDATION_ERROR', 409);
  const employee = await tx.employee.create({
    data: {
      full_name: input.fullName,
      job_title: input.jobTitle,
      department: input.department || null,
      phone: input.phone,
      is_active: true,
    },
  });
  const pHash = await hashPassword('ServiceFlow@2026');
  const user = await tx.user.create({
    data: {
      email: input.email,
      password_hash: pHash,
      role: input.role || 'STAFF',
      employeeId: employee.id,
      must_change_password: true,
      is_active: true,
    },
  });
  const res = formatEmployee({ ...employee, user });
  await AuditService.record(tx, {
    actor,
    action: AUDIT_ACTIONS.EMPLOYEE_CREATED,
    entityType: 'EMPLOYEE',
    entityId: employee.id,
    after: res,
    ip,
    requestId: reqId,
  });
  return toJson(res);
}

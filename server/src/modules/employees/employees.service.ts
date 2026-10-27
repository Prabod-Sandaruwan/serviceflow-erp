import { CreateEmployeeInput, ListEmployeesQuery, UpdateEmployeeInput } from './employees.schemas';
import { EmployeeRepository } from './employees.repository';
import { hashPassword } from '../auth/password';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { AppError } from '../../shared/errors';
import { toJson } from '../../shared/http';

type Actor = { userId?: bigint | string; role?: string };

const formatEmployee = (emp: any) => ({
  id: emp.id,
  fullName: emp.full_name,
  email: emp.user?.email,
  jobTitle: emp.job_title,
  phone: emp.phone,
  isActive: emp.is_active,
  createdAt: emp.created_at,
  updatedAt: emp.updated_at,
  full_name: emp.full_name,
  job_title: emp.job_title,
  is_active: emp.is_active,
});

export class EmployeesService {
  static async list(query: ListEmployeesQuery) {
    const page = query.page || 1, limit = query.limit || 20;
    const { total, employees } = await EmployeeRepository.list(query, (page - 1) * limit, limit);
    return {
      data: toJson(employees.map(formatEmployee)),
      meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  static async create(input: CreateEmployeeInput, actor?: Actor, ip?: string, reqId?: string) {
    return runInTransaction(async (tx) => {
      const existing = await EmployeeRepository.findByEmail(input.email, tx);
      if (existing) throw new AppError('Email already registered', 'VALIDATION_ERROR', 409);
      const employee = await tx.employee.create({
        data: { full_name: input.fullName, job_title: input.jobTitle, phone: input.phone, is_active: true },
      });
      const pHash = await hashPassword('ServiceFlow@2026');
      const user = await tx.user.create({
        data: { email: input.email, password_hash: pHash, role: 'STAFF', employeeId: employee.id, must_change_password: true, is_active: true },
      });
      const res = formatEmployee({ ...employee, user });
      await AuditService.record(tx, {
        actor, action: AUDIT_ACTIONS.EMPLOYEE_CREATED, entityType: 'EMPLOYEE', entityId: employee.id, after: res, ip, requestId: reqId,
      });
      return toJson(res);
    });
  }

  static async update(id: bigint, input: UpdateEmployeeInput, actor?: Actor, ip?: string, reqId?: string) {
    return runInTransaction(async (tx) => {
      const current = await EmployeeRepository.findById(id, tx);
      if (!current) throw new AppError('Employee not found', 'NOT_FOUND', 404);
      if (input.email && input.email !== current.user?.email) {
        const existing = await EmployeeRepository.findByEmail(input.email, tx);
        if (existing && existing.id !== id && existing.user?.employeeId !== id) {
          throw new AppError('Email already registered', 'VALIDATION_ERROR', 409);
        }
        if (current.user) {
          await tx.user.update({ where: { id: current.user.id }, data: { email: input.email } });
        } else {
          const pHash = await hashPassword('ServiceFlow@2026');
          await tx.user.create({ data: { email: input.email, password_hash: pHash, role: 'STAFF', employeeId: id } });
        }
      }
      const data: any = {};
      if (input.fullName !== undefined) data.full_name = input.fullName;
      if (input.jobTitle !== undefined) data.job_title = input.jobTitle;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.isActive !== undefined) data.is_active = input.isActive;
      const updated = await tx.employee.update({ where: { id }, data, include: { user: true } });
      if (input.isActive === false && updated.user) {
        await tx.user.update({ where: { id: updated.user.id }, data: { is_active: false } });
      }
      const res = formatEmployee({ ...updated, user: updated.user || (input.email ? { email: input.email } : current.user) });
      const action = input.isActive === false ? AUDIT_ACTIONS.EMPLOYEE_DEACTIVATED : AUDIT_ACTIONS.EMPLOYEE_UPDATED;
      await AuditService.record(tx, {
        actor, action, entityType: 'EMPLOYEE', entityId: id, before: formatEmployee(current), after: res, ip, requestId: reqId,
      });
      return toJson(res);
    });
  }
}

export default EmployeesService;

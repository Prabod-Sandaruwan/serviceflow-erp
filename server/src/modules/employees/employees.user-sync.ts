import { Tx } from '../../shared/tx';
import { UpdateEmployeeInput } from './employees.schemas';
import { EmployeeRepository } from './employees.repository';
import { hashPassword } from '../auth/password';
import { AppError } from '../../shared/errors';

export async function syncEmployeeUser(
  tx: Tx,
  id: bigint,
  current: any,
  input: UpdateEmployeeInput
): Promise<void> {
  if (input.email && input.email !== current.user?.email) {
    const existing = await EmployeeRepository.findByEmail(input.email, tx);
    if (existing && existing.id !== id && existing.user?.employeeId !== id) {
      throw new AppError('Email already registered', 'VALIDATION_ERROR', 409);
    }
    if (current.user) {
      await tx.user.update({ where: { id: current.user.id }, data: { email: input.email } });
    } else {
      const pHash = await hashPassword('ServiceFlow@2026');
      await tx.user.create({
        data: {
          email: input.email,
          password_hash: pHash,
          role: input.role || 'STAFF',
          employeeId: id,
        },
      });
    }
  }
  if (input.role && current.user) {
    await tx.user.update({ where: { id: current.user.id }, data: { role: input.role } });
  }
}

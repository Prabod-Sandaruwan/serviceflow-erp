import { UserRepository } from '../users/users.repository';
import { verifyPassword, hashPassword } from './password';
import { AppError } from '../../shared/errors';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { LoginInput } from './auth.schemas';
import { toJson } from '../../shared/http';

let cachedDummyHash: string | null = null;

export class AuthService {
  static async login(input: LoginInput, ip?: string, requestId?: string) {
    const user = await UserRepository.findByEmail(input.email);

    if (!cachedDummyHash) {
      cachedDummyHash = await hashPassword('dummy');
    }

    const hashToVerify = user
      ? user.password_hash || (user as any).passwordHash
      : cachedDummyHash;
    const isValid = await verifyPassword(hashToVerify, input.password);
    const isActive = user ? (user.is_active ?? (user as any).isActive) : false;

    if (!user || !isValid || !isActive) {
      throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    await runInTransaction(async (tx) => {
      await UserRepository.updateLastLogin(tx, user.id);
      await AuditService.record(tx, {
        actor: { userId: user.id, role: user.role },
        action: AUDIT_ACTIONS.LOGIN,
        entityType: 'USER',
        entityId: user.id,
        ip,
        requestId,
      });
    });

    const userObj = user as any;
    const { password_hash, passwordHash, ...publicProfile } = userObj;
    return toJson(publicProfile);
  }
}

export default AuthService;

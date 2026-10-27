import prisma from '../../config/prisma';
import { Tx } from '../../shared/tx';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });
  }

  static async updateLastLogin(tx: Tx, userId: bigint) {
    return tx.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    });
  }
}

export default UserRepository;

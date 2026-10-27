import prisma from '../../config/prisma';
import { Tx } from '../../shared/tx';
import { ListUsersQuery } from './users.schemas';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });
  }

  static async findByEmailWithTx(tx: Tx, email: string) {
    return tx.user.findUnique({ where: { email } });
  }

  static async updateLastLogin(tx: Tx, userId: bigint) {
    return tx.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    });
  }

  static async list(query: ListUsersQuery, skip: number, take: number) {
    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.is_active = query.isActive;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search } },
        { employee: { full_name: { contains: query.search } } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        include: { employee: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const sanitized = users.map((u: any) => {
      const { password_hash, passwordHash, ...rest } = u;
      return rest;
    });

    return { total, users: sanitized };
  }
}

export default UserRepository;

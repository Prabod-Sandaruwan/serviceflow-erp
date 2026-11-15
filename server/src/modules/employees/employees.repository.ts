import prisma from '../../config/prisma';
import { Tx } from '../../shared/tx';
import { ListEmployeesQuery } from './employees.schemas';

export class EmployeeRepository {
  static async list(query: ListEmployeesQuery, skip: number, take: number) {
    const where: any = {};
    if (query.isActive !== undefined) where.is_active = query.isActive;
    if (query.role) where.user = { role: query.role };
    if (query.search) {
      where.OR = [
        { full_name: { contains: query.search } },
        { job_title: { contains: query.search } },
        { user: { email: { contains: query.search } } },
      ];
    }
    const [total, employees] = await prisma.$transaction([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take,
        include: { user: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);
    return { total, employees };
  }

  static async create(data: any, tx?: Tx) {
    const client = tx || prisma;
    return client.employee.create({
      data,
      include: { user: true },
    });
  }

  static async update(id: bigint, data: any, tx?: Tx) {
    const client = tx || prisma;
    return client.employee.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  static async findById(id: bigint, tx?: Tx) {
    const client = tx || prisma;
    return client.employee.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  static async findByEmail(email: string, tx?: Tx) {
    const client = tx || prisma;
    const emp = await client.employee.findFirst({
      where: { user: { email } },
      include: { user: true },
    });
    if (emp) return emp;
    const user = await client.user.findUnique({
      where: { email },
      include: { employee: true },
    });
    return user?.employee ? { ...user.employee, user } : user ? ({ user } as any) : null;
  }
}

export default EmployeeRepository;

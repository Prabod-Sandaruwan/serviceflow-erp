import dotenv from 'dotenv';
dotenv.config();

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/password';

if (process.env.NODE_ENV === 'production') {
  console.error('Database seeding is not permitted in production.');
  process.exit(1);
}

const adapter = process.env.DATABASE_URL ? new PrismaMariaDb(process.env.DATABASE_URL) : undefined;
const prisma = new PrismaClient(adapter ? { adapter } : undefined);

const seedUsers = [
  { fullName: 'System Admin', email: 'admin@serviceflow.lk', role: 'ADMIN', jobTitle: 'System Administrator', department: 'IT', phone: '+94770000001' },
  { fullName: 'Alice Manager', email: 'manager1@serviceflow.lk', role: 'MANAGER', jobTitle: 'Operations Manager', department: 'Operations', phone: '+94770000002' },
  { fullName: 'Bob Manager', email: 'manager2@serviceflow.lk', role: 'MANAGER', jobTitle: 'Project Manager', department: 'Delivery', phone: '+94770000003' },
  { fullName: 'Charlie Staff', email: 'staff1@serviceflow.lk', role: 'STAFF', jobTitle: 'Software Engineer', department: 'Engineering', phone: '+94770000004' },
  { fullName: 'Diana Staff', email: 'staff2@serviceflow.lk', role: 'STAFF', jobTitle: 'Account Executive', department: 'Sales', phone: '+94770000005' },
] as const;

async function main() {
  const defaultPassword = 'ServiceFlow@2026';
  const passwordHash = await hashPassword(defaultPassword);

  for (const u of seedUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
      include: { employee: true },
    });

    let employeeId: bigint;
    if (existing?.employeeId) {
      const emp = await prisma.employee.update({
        where: { id: existing.employeeId },
        data: { full_name: u.fullName, job_title: u.jobTitle, department: u.department, phone: u.phone },
      });
      employeeId = emp.id;
    } else {
      const emp = await prisma.employee.create({
        data: { full_name: u.fullName, job_title: u.jobTitle, department: u.department, phone: u.phone },
      });
      employeeId = emp.id;
    }

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        password_hash: passwordHash,
        must_change_password: true,
        employeeId,
      },
      create: {
        email: u.email,
        role: u.role,
        password_hash: passwordHash,
        must_change_password: true,
        employeeId,
      },
    });
  }

  console.log('Database seeded successfully.');
  console.log(`Default Password: ${defaultPassword}`);
  console.log('Seeded Users:');
  for (const u of seedUsers) {
    console.log(` - ${u.email} (${u.role}) - ${u.fullName}`);
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

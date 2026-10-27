import dotenv from 'dotenv';
dotenv.config();

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Role } from '../src/generated/prisma';

// Guard check: refuse to run in production environment
if (process.env.NODE_ENV === 'production') {
  console.error('SAFETY GUARD TRIGGERED: Database seeding is not permitted in production environment.');
  process.exit(1);
}

const adapter = process.env.DATABASE_URL ? new PrismaMariaDb(process.env.DATABASE_URL) : undefined;
const prisma = new PrismaClient(adapter ? { adapter } : undefined);

import { hashPassword } from '../src/modules/auth/password';

interface InitialProfile {
  employee: {
    full_name: string;
    job_title: string;
    department: string;
    phone: string;
    is_active: boolean;
  };
  user: {
    email: string;
    role: Role;
    must_change_password: boolean;
    is_active: boolean;
  };
}

const initialProfiles: InitialProfile[] = [
  {
    employee: {
      full_name: 'System Administrator',
      job_title: 'Lead Architect',
      department: 'Management',
      phone: '+94770000001',
      is_active: true,
    },
    user: {
      email: 'admin@serviceflow.lk',
      role: Role.ADMIN,
      must_change_password: true,
      is_active: true,
    },
  },
  {
    employee: {
      full_name: 'Project Manager',
      job_title: 'Senior Project Manager',
      department: 'Delivery',
      phone: '+94770000002',
      is_active: true,
    },
    user: {
      email: 'manager@serviceflow.lk',
      role: Role.MANAGER,
      must_change_password: true,
      is_active: true,
    },
  },
  {
    employee: {
      full_name: 'Developer One',
      job_title: 'Software Engineer',
      department: 'Engineering',
      phone: '+94770000003',
      is_active: true,
    },
    user: {
      email: 'staff1@serviceflow.lk',
      role: Role.STAFF,
      must_change_password: true,
      is_active: true,
    },
  },
  {
    employee: {
      full_name: 'Sales Associate',
      job_title: 'Account Executive',
      department: 'Sales',
      phone: '+94770000004',
      is_active: true,
    },
    user: {
      email: 'staff2@serviceflow.lk',
      role: Role.STAFF,
      must_change_password: true,
      is_active: true,
    },
  },
];

async function main() {
  console.log('Seeding initial employees and users...');
  const defaultPassword = 'ServiceFlow@2026';
  const passwordHash = await hashPassword(defaultPassword);
  console.log(`Generated default initial password: ${defaultPassword}`);

  for (const profile of initialProfiles) {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.user.email },
      include: { employee: true },
    });

    let employeeId: bigint;

    if (existingUser?.employeeId) {
      // Update existing employee linked to this user
      const updatedEmployee = await prisma.employee.update({
        where: { id: existingUser.employeeId },
        data: profile.employee,
      });
      employeeId = updatedEmployee.id;
    } else {
      // Check if employee exists by phone
      const existingEmployee = await prisma.employee.findFirst({
        where: { phone: profile.employee.phone },
      });

      if (existingEmployee) {
        const updatedEmployee = await prisma.employee.update({
          where: { id: existingEmployee.id },
          data: profile.employee,
        });
        employeeId = updatedEmployee.id;
      } else {
        const newEmployee = await prisma.employee.create({
          data: profile.employee,
        });
        employeeId = newEmployee.id;
      }
    }

    // 2. Upsert the User idempotently
    const user = await prisma.user.upsert({
      where: { email: profile.user.email },
      update: {
        role: profile.user.role,
        must_change_password: profile.user.must_change_password,
        is_active: profile.user.is_active,
        password_hash: passwordHash,
        employeeId,
      },
      create: {
        email: profile.user.email,
        password_hash: passwordHash,
        role: profile.user.role,
        must_change_password: profile.user.must_change_password,
        is_active: profile.user.is_active,
        employeeId,
      },
    });

    console.log(`Seeded user: ${user.email} (${user.role}) linked to employee #${employeeId}`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

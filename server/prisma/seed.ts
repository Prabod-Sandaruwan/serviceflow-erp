import dotenv from 'dotenv';
dotenv.config();

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma';
import { hashPassword } from '../src/modules/auth/password';
import { getColomboToday } from '../src/lib/date';
import { seedQuotations } from './seed.quotations';
import { seedProjects } from './seed.projects';
import { seedInvoices } from './seed.invoices';
import { seedExpenses } from './seed.expenses';
import { seedAuditLogs } from './seed.audit';

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

const seedClients = [
  { display_name: 'Ceylon Spice Co.', email: 'info@ceylonspice.lk', phone: '+94112345671', registration_number: 'PV-001234' },
  { display_name: 'Colombo Tech Solutions', email: 'contact@colombotech.lk', phone: '+94112345672', registration_number: 'PV-001235' },
  { display_name: 'Lanka Textiles', email: 'sales@lankatextiles.lk', phone: '+94112345673', registration_number: 'PV-001236' },
];

async function main() {
  const passwordHash = await hashPassword('12345');

  for (const u of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    const empData = { full_name: u.fullName, job_title: u.jobTitle, department: u.department, phone: u.phone };
    const emp = existing?.employeeId
      ? await prisma.employee.update({ where: { id: existing.employeeId }, data: empData })
      : await prisma.employee.create({ data: empData });

    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, password_hash: passwordHash, must_change_password: false, employeeId: emp.id },
      create: { email: u.email, role: u.role, password_hash: passwordHash, must_change_password: false, employeeId: emp.id },
    });
  }

  const clients: any[] = [];
  for (const c of seedClients) {
    const found = await prisma.client.findFirst({ where: { display_name: c.display_name } });
    clients.push(found || (await prisma.client.create({ data: c })));
  }

  const [admin, manager1, manager2, staff1, staff2] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: 'admin@serviceflow.lk' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'manager1@serviceflow.lk' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'manager2@serviceflow.lk' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'staff1@serviceflow.lk' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'staff2@serviceflow.lk' } }),
  ]);

  const seedLeads = [
    { ownerId: staff1.id, status: 'NEW' as const, expected_value: 25000 },
    { ownerId: staff1.id, status: 'QUALIFIED' as const, expected_value: 75000 },
    { ownerId: admin.id, status: 'CONVERTED' as const, expected_value: 120000, convertedClientId: clients[0].id },
    { ownerId: staff1.id, status: 'LOST' as const, expected_value: 40000, lost_reason: 'Budget cancelled by client' },
  ];

  const colomboToday = getColomboToday();
  for (const [i, l] of seedLeads.entries()) {
    const existing = await prisma.lead.findFirst({ where: { ownerId: l.ownerId, status: l.status } });
    const lead = existing || (await prisma.lead.create({ data: l }));
    const hasFollowUp = await prisma.followUp.findFirst({ where: { leadId: lead.id } });
    if (!hasFollowUp) {
      const fDate = new Date(colomboToday.getTime() + (i === 0 ? 86400000 * 2 : -86400000 * 2));
      const fType = i === 0 ? 'CALL' : 'MEETING';
      const fStat = i === 0 ? 'SCHEDULED' : 'COMPLETED';
      if (i <= 1) await prisma.followUp.create({ data: { leadId: lead.id, follow_up_date: fDate, type: fType, status: fStat, createdBy: staff1.id } });
    }
  }

  await seedQuotations(prisma, clients, { admin, manager1, manager2, staff1, staff2 }, colomboToday);
  await seedProjects(prisma, { admin, manager1, manager2, staff1, staff2 }, colomboToday);
  await seedInvoices(prisma, { admin, manager1, manager2, staff1, staff2 }, colomboToday);
  await seedExpenses(prisma, { admin, manager1, manager2, staff1, staff2 }, colomboToday);
  await seedAuditLogs(prisma, { admin, manager1, manager2, staff1, staff2 }, colomboToday);
  console.log('Database seeded with demo accounts (password: 12345): admin, manager1, manager2, staff1, staff2@serviceflow.lk');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

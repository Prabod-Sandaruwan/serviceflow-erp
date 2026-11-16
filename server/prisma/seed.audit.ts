import { PrismaClient } from '../src/generated/prisma';

export async function seedAuditLogs(prisma: PrismaClient, users: Record<string, any>, today: Date) {
  if ((await prisma.auditLog.count({ where: { action: 'QUOTATION_APPROVED' } })) > 0) return;
  const msDay = 86400000;
  const d = (daysAgo: number) => new Date(today.getTime() - daysAgo * msDay);

  const logs = [
    {
      actorUserId: users.admin.id,
      actorRole: 'ADMIN',
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: users.manager1.id,
      afterJson: { email: 'manager1@serviceflow.lk', role: 'MANAGER', jobTitle: 'Operations Manager' },
      createdAt: d(30),
      ipAddress: '127.0.0.1',
    },
    {
      actorUserId: users.admin.id,
      actorRole: 'ADMIN',
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: users.staff1.id,
      afterJson: { email: 'staff1@serviceflow.lk', role: 'STAFF', jobTitle: 'Software Engineer' },
      createdAt: d(29),
      ipAddress: '127.0.0.1',
    },
    {
      actorUserId: users.staff2.id,
      actorRole: 'STAFF',
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      afterJson: { displayName: 'Ceylon Spice Co.', registrationNumber: 'PV-001234' },
      createdAt: d(25),
      ipAddress: '192.168.1.105',
    },
    {
      actorUserId: users.staff1.id,
      actorRole: 'STAFF',
      action: 'QUOTATION_CREATED',
      entityType: 'QUOTATION',
      afterJson: { quotationNumber: 'QT-2026-0001', total: '150000.00', status: 'DRAFT' },
      createdAt: d(20),
      ipAddress: '192.168.1.104',
    },
    {
      actorUserId: users.manager1.id,
      actorRole: 'MANAGER',
      action: 'QUOTATION_APPROVED',
      entityType: 'QUOTATION',
      beforeJson: { status: 'PENDING_APPROVAL' },
      afterJson: { status: 'APPROVED', approvedBy: users.manager1.email },
      createdAt: d(18),
      ipAddress: '192.168.1.102',
    },
    {
      actorUserId: users.manager2.id,
      actorRole: 'MANAGER',
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      afterJson: { projectCode: 'PRJ-2026-0001', name: 'ERP Implementation', status: 'ACTIVE' },
      createdAt: d(15),
      ipAddress: '192.168.1.103',
    },
    {
      actorUserId: users.manager1.id,
      actorRole: 'MANAGER',
      action: 'INVOICE_ISSUED',
      entityType: 'INVOICE',
      beforeJson: { status: 'DRAFT' },
      afterJson: { invoiceNumber: 'INV-2026-0001', total: '100000.00', status: 'ISSUED' },
      createdAt: d(10),
      ipAddress: '192.168.1.102',
    },
    {
      actorUserId: users.manager1.id,
      actorRole: 'MANAGER',
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      afterJson: { amount: '50000.00', method: 'BANK_TRANSFER', reference: 'REF-BANK-001' },
      createdAt: d(5),
      ipAddress: '192.168.1.102',
    },
    {
      actorUserId: users.admin.id,
      actorRole: 'ADMIN',
      action: 'LOGIN',
      entityType: 'AUTH',
      afterJson: { email: 'admin@serviceflow.lk', success: true },
      createdAt: d(0),
      ipAddress: '127.0.0.1',
    },
  ];

  await prisma.auditLog.createMany({ data: logs });
}

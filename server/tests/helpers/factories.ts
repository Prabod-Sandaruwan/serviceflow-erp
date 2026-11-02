import { prisma } from '../../src/config/prisma';

export const assertTestDb = (): void => {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.includes('serviceflow_test')) {
    throw new Error('Refusing to run test operations on non-test database: ' + dbUrl);
  }
};

export const truncateAll = async (): Promise<void> => {
  assertTestDb();
  await prisma.auditLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.updateMany({ data: { revisionOfId: null } });
  await prisma.quotation.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
};

export const createEmployee = async (overrides: any = {}) => {
  assertTestDb();
  const { fullName, jobTitle, email, ...rest } = overrides;
  return prisma.employee.create({
    data: {
      full_name: overrides.full_name || fullName || 'Test Employee',
      job_title: overrides.job_title || jobTitle || 'Developer',
      department: overrides.department || 'Engineering',
      phone: overrides.phone || '+94770000000',
      ...rest,
    },
  });
};

export const createUser = async (overrides: any = {}) => {
  assertTestDb();
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let employeeId = overrides.employeeId;
  if (!employeeId && !overrides.employee) {
    const emp = await createEmployee();
    employeeId = emp.id;
  }
  const { passwordHash, isActive, mustChangePassword, ...rest } = overrides;
  return prisma.user.create({
    data: {
      email: overrides.email || `user-${uid}@test.com`,
      password_hash: overrides.password_hash || passwordHash || 'hash',
      role: overrides.role || 'STAFF',
      is_active: overrides.is_active ?? (isActive !== undefined ? isActive : true),
      must_change_password:
        overrides.must_change_password ??
        (mustChangePassword !== undefined ? mustChangePassword : true),
      ...(employeeId ? { employee: { connect: { id: employeeId } } } : {}),
      ...rest,
    },
  });
};

export const createClient = async (overrides: any = {}) => {
  assertTestDb();
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { clientType, displayName, ...rest } = overrides;
  return prisma.client.create({
    data: {
      client_type: overrides.client_type || clientType || 'INDIVIDUAL',
      display_name: overrides.display_name || displayName || `Client-${uid}`,
      ...rest,
    },
  });
};

export const createQuotation = async (overrides: any = {}) => {
  assertTestDb();
  const uid = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date();
  return prisma.quotation.create({
    data: {
      quotationNumber: overrides.quotationNumber || `QT-${uid}`,
      title: overrides.title || 'Quotation', status: overrides.status || 'DRAFT',
      quotationDate: overrides.quotationDate || now,
      validUntil: overrides.validUntil || new Date(now.getTime() + 86400000),
      subtotal: overrides.subtotal ?? 100, taxAmount: overrides.taxAmount ?? 0,
      total: overrides.total ?? 100, createdBy: overrides.createdBy || 1n,
      clientId: overrides.clientId || 1n, ...overrides,
    },
  });
};

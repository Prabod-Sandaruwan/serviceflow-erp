import { PrismaClient } from '../src/generated/prisma';

export async function seedExpenses(
  prisma: PrismaClient,
  users: { admin: any; manager1: any; manager2: any; staff1: any; staff2: any },
  today: Date,
) {
  const project = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-0001' },
  });
  if (!project) return;

  const activeDesc = 'IDE & Software Developer Licenses';
  const existingActive = await prisma.expense.findFirst({
    where: { projectId: project.id, description: activeDesc },
  });

  if (!existingActive) {
    await prisma.expense.create({
      data: {
        projectId: project.id,
        category: 'SOFTWARE_LICENSE',
        description: activeDesc,
        supplier: 'JetBrains Inc.',
        amount: 300.0,
        expenseDate: today,
        status: 'ACTIVE',
        recordedBy: users.manager1.id,
      },
    });
  }

  const voidedDesc = 'Accidental Staging Server Purchase';
  const existingVoided = await prisma.expense.findFirst({
    where: { projectId: project.id, description: voidedDesc },
  });

  if (!existingVoided) {
    await prisma.expense.create({
      data: {
        projectId: project.id,
        category: 'HOSTING_INFRASTRUCTURE',
        description: voidedDesc,
        supplier: 'AWS Cloud Services',
        amount: 150.0,
        expenseDate: today,
        status: 'VOIDED',
        recordedBy: users.manager1.id,
        voidedBy: users.admin.id,
        voidedAt: today,
        voidReason: 'Duplicate invoice submitted in error',
      },
    });
  }
}

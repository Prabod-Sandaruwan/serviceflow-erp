import { PrismaClient } from '../src/generated/prisma';

export async function seedProjects(
  prisma: PrismaClient,
  users: { admin: any; manager1: any; manager2: any; staff1: any; staff2: any },
  today: Date,
) {
  const quote =
    (await prisma.quotation.findUnique({ where: { quotationNumber: 'QT-2026-0006' } })) ||
    (await prisma.quotation.findFirst({ where: { status: 'ACCEPTED' } }));
  if (!quote) return;

  let project = await prisma.project.findUnique({
    where: { quotationId: quote.id },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        projectCode: 'PRJ-2026-0001',
        quotationId: quote.id,
        clientId: quote.clientId,
        name: quote.title || 'Payment Gateway Integration',
        description: 'Payment gateway integration project',
        status: 'ACTIVE',
        startDate: new Date(today.getTime() - 14 * 86400000),
        endDate: new Date(today.getTime() + 45 * 86400000),
        budgetAmount: quote.total,
        createdBy: users.manager1.id,
      },
    });
  }

  const msData = [
    { name: 'Phase 1 - API Architecture', sort: 1, status: 'APPROVED' as const, amt: 100000, due: new Date(today.getTime() - 5 * 86400000), appBy: users.manager1.id, appAt: today },
    { name: 'Phase 2 - Core Integration', sort: 2, status: 'COMPLETED' as const, amt: 100000, due: today, compAt: today },
    { name: 'Phase 3 - Deployment', sort: 3, status: 'PENDING' as const, amt: 50000, due: new Date(today.getTime() + 30 * 86400000) },
  ];

  const milestones: any[] = [];
  for (const m of msData) {
    let milestone = await prisma.milestone.findFirst({
      where: { projectId: project.id, sortOrder: m.sort },
    });
    if (!milestone) {
      milestone = await prisma.milestone.create({
        data: {
          projectId: project.id,
          name: m.name,
          sortOrder: m.sort,
          status: m.status,
          billingAmount: m.amt,
          dueDate: m.due,
          completedAt: (m as any).compAt ?? null,
          approvedBy: (m as any).appBy ?? null,
          approvedAt: (m as any).appAt ?? null,
        },
      });
    }
    milestones.push(milestone);
  }

  const tasksData = [
    { title: 'Architecture Blueprint', mid: milestones[0].id, status: 'DONE' as const, pri: 'HIGH' as const, emp: users.staff1.employeeId },
    { title: 'API Specification & Mocking', mid: milestones[0].id, status: 'DONE' as const, pri: 'MEDIUM' as const, emp: users.staff2.employeeId },
    { title: 'Gateway SDK Implementation', mid: milestones[1].id, status: 'DONE' as const, pri: 'HIGH' as const, emp: users.staff1.employeeId },
    { title: 'Sandbox Integration Tests', mid: milestones[1].id, status: 'DONE' as const, pri: 'MEDIUM' as const, emp: users.manager2.employeeId },
    { title: 'Production Key Provisioning', mid: milestones[2].id, status: 'IN_PROGRESS' as const, pri: 'HIGH' as const, emp: users.staff1.employeeId },
    { title: 'Final Client Sign-off', mid: milestones[2].id, status: 'TODO' as const, pri: 'LOW' as const, emp: users.manager1.employeeId },
    { title: 'Project Documentation Review', mid: null, status: 'TODO' as const, pri: 'MEDIUM' as const, emp: users.staff1.employeeId },
  ];

  for (const t of tasksData) {
    const existing = await prisma.task.findFirst({
      where: { projectId: project.id, title: t.title },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          projectId: project.id,
          milestoneId: t.mid,
          title: t.title,
          status: t.status,
          priority: t.pri,
          assigneeId: t.emp,
          createdBy: users.manager1.id,
        },
      });
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { reportDateRangeSchema } from './reports.schemas';
import {
  getRevenue,
  getPaymentsReceived,
  getExpenses,
  getOutstanding,
} from './reports.repository';
import { calculateProfit, calculateMargin } from './formulas';
import { getProjectProfitabilityReport } from './reports.service';
import prisma from '../../config/prisma';

export async function getFinanceReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportDateRangeSchema.parse(req.query);
    const [revenue, paymentsReceived, expenses, outstanding] = await Promise.all([
      getRevenue(query.startDate, query.endDate),
      getPaymentsReceived(query.startDate, query.endDate),
      getExpenses(query.startDate, query.endDate),
      getOutstanding(query.endDate),
    ]);

    const estimatedProfitability = calculateProfit(revenue, expenses);
    const margin = calculateMargin(revenue, estimatedProfitability);

    res.status(200).json({
      data: {
        from: query.from,
        to: query.to,
        revenue,
        paymentsReceived,
        expenses,
        outstanding,
        estimatedProfitability,
        margin,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectsReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportDateRangeSchema.parse(req.query);
    const where: any = { status: { not: 'CANCELLED' } };
    if (query.projectId) {
      where.id = BigInt(query.projectId);
    }

    const projects = await prisma.project.findMany({
      where,
      select: { id: true, name: true, projectCode: true },
    });

    const list = await Promise.all(
      projects.map(async (p) => {
        const report = await getProjectProfitabilityReport(p.id.toString());
        return {
          ...report,
          name: p.name,
          projectCode: p.projectCode,
        };
      })
    );

    res.status(200).json({ data: list });
  } catch (err) {
    next(err);
  }
}

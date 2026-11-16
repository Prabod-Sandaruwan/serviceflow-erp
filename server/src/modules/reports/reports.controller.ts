import { Request, Response, NextFunction } from 'express';
import { reportDateRangeSchema, reportExportQuerySchema } from './reports.schemas';
import { getFinanceReport, getProjectsReport } from './reports.service';
import { toCsv } from '../../shared/csv';

export async function getFinanceReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportDateRangeSchema.parse(req.query);
    const data = await getFinanceReport(query.startDate, query.endDate);
    res.status(200).json({
      data: { from: query.from, to: query.to, ...data },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectsReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportDateRangeSchema.parse(req.query);
    const list = await getProjectsReport(query.projectId);
    res.status(200).json({ data: list });
  } catch (err) {
    next(err);
  }
}

export async function exportCsvReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportExportQuerySchema.parse(req.query);
    let csv = '';

    if (query.type === 'finance') {
      const fin = await getFinanceReport(query.startDate, query.endDate);
      const row = {
        Revenue: fin.revenue,
        'Payments Received': fin.paymentsReceived,
        Outstanding: fin.outstanding,
        Expenses: fin.expenses,
        'Estimated Profitability': fin.estimatedProfitability,
      };
      csv = toCsv([row], Object.keys(row));
    } else {
      const projects = await getProjectsReport(query.projectId);
      const rows = projects.map((p) => ({
        'Project ID': p.projectId,
        Revenue: p.revenue,
        Billed: p.billed,
        Collected: p.collected,
        Expenses: p.expenses,
        'Estimated Profitability': p.estimatedProfitability,
      }));
      const cols = [
        'Project ID',
        'Revenue',
        'Billed',
        'Collected',
        'Expenses',
        'Estimated Profitability',
      ];
      csv = toCsv(rows, cols);
    }

    const filename = (req.query.filename as string) || 'export.csv';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

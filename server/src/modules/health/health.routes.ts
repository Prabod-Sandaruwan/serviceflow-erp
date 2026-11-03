import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const healthCheckHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ServiceFlow ERP API',
    });
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: 'Database ping failed',
    });
  }
};


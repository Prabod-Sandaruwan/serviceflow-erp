import prisma from '../../lib/prisma';

export async function getClientStats() {
  const [total, active, corporate, individuals] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { is_active: true } }),
    prisma.client.count({ where: { client_type: 'COMPANY' } }),
    prisma.client.count({ where: { client_type: 'INDIVIDUAL' } }),
  ]);
  return { total, active, corporate, individuals };
}

export default getClientStats;

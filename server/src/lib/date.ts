export const COMPANY_TIMEZONE = 'Asia/Colombo';

export function getColomboToday(now: Date = new Date()): Date {
  const colomboDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: COMPANY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return new Date(`${colomboDateStr}T00:00:00.000+05:30`);
}

export function isOverdueColombo(date: Date, status: string): boolean {
  return status === 'PENDING' && new Date(date) < getColomboToday();
}

export default { COMPANY_TIMEZONE, getColomboToday, isOverdueColombo };

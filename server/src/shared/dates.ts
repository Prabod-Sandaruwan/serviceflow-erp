export const COMPANY_TIMEZONE = 'Asia/Colombo';

export const formatDate = (date: string | Date, timeZone = COMPANY_TIMEZONE): string => {
  if (date instanceof Date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
  return date.slice(0, 10);
};

export const today = (now: Date = new Date(), timeZone = COMPANY_TIMEZONE): string =>
  formatDate(now, timeZone);

export const isBefore = (dateA: string | Date, dateB: string | Date): boolean =>
  formatDate(dateA) < formatDate(dateB);

export const isOverdueInvoice = (
  invoice: {
    status: string;
    dueDate: string | Date;
    balance: string | number;
  },
  currentDay = today()
): boolean => {
  return (
    (invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID') &&
    Number(invoice.balance) > 0 &&
    isBefore(invoice.dueDate, currentDay)
  );
};

export const isExpiredQuotation = (
  quotation: { status: string; validUntil: string | Date },
  currentDay = today()
): boolean => {
  return quotation.status === 'SENT' && isBefore(quotation.validUntil, currentDay);
};

export const isOverdueTask = (
  task: { status: string; dueDate?: string | Date | null },
  currentDay = today()
): boolean => {
  return (
    Boolean(task.dueDate) &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED' &&
    isBefore(task.dueDate!, currentDay)
  );
};

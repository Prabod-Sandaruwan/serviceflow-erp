const INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  let str = String(val);

  if (INJECTION_PREFIXES.some((char) => str.startsWith(char))) {
    str = `'${str}`;
  }

  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCsv(rows: Record<string, any>[], columns: string[]): string {
  const headerRow = columns.map(escapeCsvCell).join(',');
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCsvCell(row[col])).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
}

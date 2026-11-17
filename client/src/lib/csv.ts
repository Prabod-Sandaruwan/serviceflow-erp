const INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }
  let str = String(val);

  if (INJECTION_PREFIXES.some((char) => str.startsWith(char))) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const headerRow = headers.join(',');
  const dataRows = rows.map((r) => r.map(escapeCsvCell).join(','));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

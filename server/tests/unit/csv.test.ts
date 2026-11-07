import { describe, it, expect } from 'vitest';
import { toCsv, escapeCsvCell } from '../../src/shared/csv';

describe('CSV Utility (RFC 4180 & Formula Injection Protection)', () => {
  it('Test 1 (RFC 4180 Quoting): wraps fields with commas, quotes, and newlines, escaping quotes', () => {
    const input = [
      {
        comma: 'hello, world',
        quotes: 'He said "Hello"',
        newline: 'line1\nline2',
        crlf: 'line1\r\nline2',
      },
    ];
    const columns = ['comma', 'quotes', 'newline', 'crlf'];
    const csv = toCsv(input, columns);

    expect(csv).toContain('"hello, world"');
    expect(csv).toContain('"He said ""Hello"""');
    expect(csv).toContain('"line1\nline2"');
    expect(csv).toContain('"line1\r\nline2"');
  });

  it('Test 2 (Injection Protection): prefixes =, +, -, @, \\t, and \\r with apostrophe', () => {
    const injectionValues = ['=1+1', '+A1', '-5', '@SUM', '\tTabbed', '\rCR'];
    for (const val of injectionValues) {
      const escaped = escapeCsvCell(val);
      expect(escaped).toContain(`'${val}`);
    }

    const row: Record<string, string> = {};
    injectionValues.forEach((val, idx) => {
      row[`col${idx}`] = val;
    });
    const cols = Object.keys(row);
    const csv = toCsv([row], cols);

    for (const val of injectionValues) {
      expect(csv).toContain(`'${val}`);
    }
  });

  it('handles null, undefined, and plain numbers correctly', () => {
    const row = { a: null, b: undefined, c: 123.45, d: 'plain' };
    const csv = toCsv([row], ['a', 'b', 'c', 'd']);
    expect(csv).toBe('a,b,c,d\r\n,,123.45,plain');
  });
});

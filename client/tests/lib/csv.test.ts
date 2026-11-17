import { describe, it, expect } from "vitest";
import { escapeCsvCell } from "../../src/lib/csv";

describe("escapeCsvCell formula injection protection (CWE-1236)", () => {
  it("escapes standard values safely in double quotes", () => {
    expect(escapeCsvCell("Hello")).toBe('"Hello"');
    expect(escapeCsvCell('He said "Hi"')).toBe('"He said ""Hi"""');
    expect(escapeCsvCell(123)).toBe('"123"');
    expect(escapeCsvCell(null)).toBe('""');
  });

  it("prepends single quote to neutralize formula prefixes (=, +, -, @, \\t, \\r)", () => {
    expect(escapeCsvCell('=cmd|"/C calc"!A0')).toBe('"\'=cmd|""/C calc""!A0"');
    expect(escapeCsvCell("+12345")).toBe('"\'+12345"');
    expect(escapeCsvCell("-SUM(A1:A10)")).toBe('"\'-SUM(A1:A10)"');
    expect(escapeCsvCell('@HYPERLINK("http://attacker.com")')).toBe(
      '"\'@HYPERLINK(""http://attacker.com"")"',
    );
    expect(escapeCsvCell("\tmalicious")).toBe('"\'\tmalicious"');
  });
});

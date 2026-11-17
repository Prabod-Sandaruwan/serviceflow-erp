import { describe, it, expect } from "vitest";
import {
  formatFieldLabel,
  formatValue,
  computeAuditDiff,
} from "../../../src/features/admin/auditDiffUtils";

describe("auditDiffUtils", () => {
  it("formats camelCase and snake_case labels properly", () => {
    expect(formatFieldLabel("status")).toBe("Status");
    expect(formatFieldLabel("actorUserId")).toBe("Actor User Id");
    expect(formatFieldLabel("created_at")).toBe("Created at");
  });

  it("formats values including null, boolean, and objects", () => {
    expect(formatValue(null)).toBe("None");
    expect(formatValue(undefined)).toBe("None");
    expect(formatValue(true)).toBe("True");
    expect(formatValue(false)).toBe("False");
    expect(formatValue("ACTIVE")).toBe("ACTIVE");
    expect(formatValue({ code: "LKR" })).toBe('{"code":"LKR"}');
  });

  it("computes field-level diffs correctly for updates and creations", () => {
    const diffs = computeAuditDiff(
      { status: "DRAFT", amount: 100 },
      { status: "ISSUED", amount: 100, notes: "urgent" },
    );
    expect(diffs).toHaveLength(3);

    const statusDiff = diffs.find((d) => d.field === "status");
    expect(statusDiff?.type).toBe("changed");
    expect(statusDiff?.before).toBe("DRAFT");
    expect(statusDiff?.after).toBe("ISSUED");

    const amountDiff = diffs.find((d) => d.field === "amount");
    expect(amountDiff?.type).toBe("unchanged");

    const notesDiff = diffs.find((d) => d.field === "notes");
    expect(notesDiff?.type).toBe("added");
  });
});

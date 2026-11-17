export interface DiffItem {
  field: string;
  label: string;
  before: any;
  after: any;
  type: "changed" | "added" | "removed" | "unchanged";
}

export function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function formatValue(val: any): string {
  if (val === null || val === undefined) return "None";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function computeAuditDiff(before: any, after: any): DiffItem[] {
  const b = before && typeof before === "object" ? before : {};
  const a = after && typeof after === "object" ? after : {};
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));

  return keys.map((key) => {
    const hasB = key in b;
    const hasA = key in a;
    const valB = b[key];
    const valA = a[key];
    const isSame = JSON.stringify(valB) === JSON.stringify(valA);

    let type: DiffItem["type"] = "changed";
    if (!hasB && hasA) type = "added";
    else if (hasB && !hasA) type = "removed";
    else if (isSame) type = "unchanged";

    return {
      field: key,
      label: formatFieldLabel(key),
      before: valB,
      after: valA,
      type,
    };
  });
}

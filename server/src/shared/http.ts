import { Response } from 'express';

const isDecimal = (val: unknown): boolean => {
  return (
    typeof val === 'object' &&
    val !== null &&
    ('isDecimal' in val || ('d' in val && 'e' in val && 's' in val)) &&
    typeof (val as any).toString === 'function'
  );
};

export function toJson<T>(data: T): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data === 'bigint') {
    return data.toString();
  }
  if (isDecimal(data)) {
    return (data as any).toString();
  }
  if (data instanceof Date) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => toJson(item));
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = toJson(value);
    }
    return result;
  }
  return data;
}

export function ok<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ data: toJson(data) });
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json({ data: toJson(data) });
}

export function paged<T>(
  res: Response,
  data: T[],
  meta: { page: number; pageSize: number; total: number }
): void {
  const totalPages = Math.ceil(meta.total / meta.pageSize) || 1;
  res.status(200).json({
    data: toJson(data),
    meta: {
      ...meta,
      totalPages,
    },
  });
}

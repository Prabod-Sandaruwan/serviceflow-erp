import { ValidationError, ErrorDetail } from './errors';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PagingParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePaging(query: Record<string, any>): PagingParams {
  const details: ErrorDetail[] = [];
  const rawPage = query?.page ?? 1;
  const rawPageSize = query?.pageSize ?? query?.limit ?? 20;

  const pageNum = Number(rawPage);
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    details.push({
      field: 'page',
      issue: 'Page must be an integer greater than or equal to 1',
    });
  }

  const pageSizeNum = Number(rawPageSize);
  if (!Number.isInteger(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
    details.push({
      field: 'pageSize',
      issue: 'PageSize must be an integer between 1 and 100',
    });
  }

  if (details.length > 0) {
    throw new ValidationError('Invalid pagination parameters', details);
  }

  return {
    page: pageNum,
    pageSize: pageSizeNum,
    skip: (pageNum - 1) * pageSizeNum,
    take: pageSizeNum,
  };
}

export function parseSort<T extends string>(
  sortParam: unknown,
  allowedFields: readonly T[],
  defaultSort: Record<T, 'asc' | 'desc'>
): Record<string, 'asc' | 'desc'> {
  if (!sortParam || typeof sortParam !== 'string' || sortParam.trim() === '') {
    return defaultSort;
  }

  const trimmed = sortParam.trim();
  let direction: 'asc' | 'desc' = 'asc';
  let field = trimmed;

  if (trimmed.startsWith('-')) {
    direction = 'desc';
    field = trimmed.slice(1);
  } else if (trimmed.startsWith('+')) {
    direction = 'asc';
    field = trimmed.slice(1);
  }

  if (!allowedFields.includes(field as T)) {
    throw new ValidationError('Invalid sort field', [
      { field: 'sort', issue: `Sort by '${field}' is not allowed` },
    ]);
  }

  return { [field]: direction };
}

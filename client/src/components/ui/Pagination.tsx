import { Button } from './Forms';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
      <span style={{ color: '#64748b' }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          type="button"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

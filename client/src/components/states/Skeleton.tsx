import { Loader2 } from 'lucide-react';

export interface SkeletonProps {
  lines?: number;
  height?: string;
  showSpinner?: boolean;
}

export function Skeleton({ lines = 3, height = '1rem', showSpinner = true }: SkeletonProps) {
  return (
    <div
      role="progressbar"
      aria-label="Loading content"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', width: '100%' }}
    >
      {showSpinner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Loading data...</span>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer"
          style={{
            height,
            width: i === lines - 1 ? '60%' : '100%',
            borderRadius: '6px',
            backgroundColor: '#e2e8f0',
          }}
        />
      ))}
    </div>
  );
}

export default Skeleton;

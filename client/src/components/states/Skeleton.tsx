export interface SkeletonProps {
  lines?: number;
  height?: string;
}

export function Skeleton({ lines = 3, height = '1rem' }: SkeletonProps) {
  return (
    <div
      role="progressbar"
      aria-label="Loading content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
        width: '100%',
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: i === lines - 1 ? '60%' : '100%',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

export default Skeleton;

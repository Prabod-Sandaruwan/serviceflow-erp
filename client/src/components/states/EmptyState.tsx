export interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No data available.' }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px dashed #cbd5e1',
        margin: '1rem 0',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
}

export default EmptyState;

import { ApiError } from '../../lib/ApiError';

export interface ErrorPanelProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorPanel({ error, onRetry }: ErrorPanelProps) {
  let message = 'An unexpected error occurred.';
  let requestId: string | undefined;

  if (error instanceof Error && (error.name === 'ApiError' || error instanceof ApiError)) {
    const apiErr = error as ApiError;
    requestId = apiErr.requestId;
    if (apiErr.status >= 500) {
      message = 'A server error occurred. Please try again later.';
    } else {
      message = apiErr.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        margin: '1rem 0',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        textAlign: 'center',
        gap: '0.5rem',
      }}
    >
      <p style={{ margin: 0, color: '#991b1b', fontWeight: 500, fontSize: '0.95rem' }}>
        {message}
      </p>
      {requestId && (
        <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
          Request ID: {requestId}
        </span>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: '0.5rem',
            padding: '0.4rem 1rem',
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorPanel;

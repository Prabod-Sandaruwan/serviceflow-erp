export default function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #4f46e5',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 800,
            display: 'inline-block',
            background: 'linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.025em',
          }}
        >
          Dashboard Page
        </h1>
      </div>
    </div>
  );
}

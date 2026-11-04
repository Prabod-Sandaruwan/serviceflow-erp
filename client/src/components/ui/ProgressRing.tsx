import React from 'react';

interface ProgressRingProps {
  label: string;
  percent: number;
  subtitle?: string;
  color?: string;
  size?: number;
  delayMs?: number;
}

export function ProgressRing({
  label,
  percent,
  subtitle,
  color = '#4f46e5',
  size = 80,
  delayMs = 0,
}: ProgressRingProps) {
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (p / 100) * circ;
  const isComplete = p === 100;
  const strokeColor = isComplete ? '#16a34a' : color;

  return (
    <div
      className="animate-zoom-in"
      style={{
        display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem',
        background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
        flex: '1 1 240px', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        animationDelay: `${delayMs}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 10px 25px -5px ${isComplete ? 'rgba(22, 163, 74, 0.15)' : color === '#0284c7' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(79, 70, 229, 0.15)'}, 0 4px 6px -2px rgba(0, 0, 0, 0.05)`;
        e.currentTarget.style.borderColor = isComplete ? '#86efac' : '#c7d2fe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="animate-ring"
            style={{
              '--ring-circ': `${circ}`,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
            } as React.CSSProperties}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
          {p}%
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{label}</span>
          {isComplete && (
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
              Done
            </span>
          )}
        </div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default ProgressRing;

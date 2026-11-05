import type { ReactNode, CSSProperties } from 'react';

export type StatusType =
  | 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'IN_PROGRESS'
  | 'COMPLETED' | 'PAID' | 'VOID' | 'NEW' | 'CONTACTED' | 'QUALIFIED'
  | 'PROPOSAL_SENT' | 'CONVERTED' | 'WON' | 'LOST' | 'PLANNED' | 'ON_HOLD'
  | 'CANCELLED' | 'ISSUED' | 'PARTIALLY_PAID' | 'OVERDUE' | string;

interface StatusConfig { label: string; bg: string; color: string; }

const STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { label: 'Active', bg: '#dcfce7', color: '#166534' },
  INACTIVE: { label: 'Inactive', bg: '#f1f5f9', color: '#475569' },
  DRAFT: { label: 'Draft', bg: '#fef3c7', color: '#92400e' },
  PENDING: { label: 'Pending', bg: '#ffedd5', color: '#9a3412' },
  APPROVED: { label: 'Approved', bg: '#e0e7ff', color: '#3730a3' },
  IN_PROGRESS: { label: 'In Progress', bg: '#e0f2fe', color: '#0369a1' },
  COMPLETED: { label: 'Completed', bg: '#dcfce7', color: '#15803d' },
  PAID: { label: 'Paid', bg: '#d1fae5', color: '#065f46' },
  PARTIALLY_PAID: { label: 'Partially Paid', bg: '#fef3c7', color: '#92400e' },
  ISSUED: { label: 'Issued', bg: '#e0f2fe', color: '#0369a1' },
  OVERDUE: { label: 'Overdue', bg: '#fee2e2', color: '#991b1b' },
  VOID: { label: 'Void', bg: '#fee2e2', color: '#991b1b' },
  NEW: { label: 'New', bg: '#eff6ff', color: '#1d4ed8' },
  CONTACTED: { label: 'Contacted', bg: '#e0f2fe', color: '#0369a1' },
  QUALIFIED: { label: 'Qualified', bg: '#f5f3ff', color: '#6d28d9' },
  PROPOSAL_SENT: { label: 'Proposal Sent', bg: '#fdf4ff', color: '#a21caf' },
  CONVERTED: { label: 'Converted', bg: '#dcfce7', color: '#15803d' },
  WON: { label: 'Won', bg: '#dcfce7', color: '#15803d' },
  LOST: { label: 'Lost', bg: '#fee2e2', color: '#991b1b' },
  PENDING_APPROVAL: { label: 'Pending Approval', bg: '#ffedd5', color: '#9a3412' },
  REJECTED: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
  SENT: { label: 'Sent', bg: '#e0f2fe', color: '#0369a1' },
  ACCEPTED: { label: 'Accepted', bg: '#dcfce7', color: '#15803d' },
  DECLINED: { label: 'Declined', bg: '#fee2e2', color: '#991b1b' },
  EXPIRED: { label: 'Expired', bg: '#f1f5f9', color: '#475569' },
  PLANNED: { label: 'Planned', bg: '#f1f5f9', color: '#475569' },
  ON_HOLD: { label: 'On Hold', bg: '#fef3c7', color: '#92400e' },
  CANCELLED: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b' },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  style?: CSSProperties;
}

export function Badge({ children, variant = 'default', style, ...props }: BadgeProps) {
  const styles = {
    default: { bg: '#f1f5f9', color: '#475569' },
    danger: { bg: '#fee2e2', color: '#991b1b' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    success: { bg: '#dcfce7', color: '#166534' },
    info: { bg: '#e0f2fe', color: '#0369a1' },
  };
  const cfg = styles[variant] || styles.default;
  return (
    <span
      {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem',
        fontWeight: 600, backgroundColor: cfg.bg, color: cfg.color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusType }) {
  const normalized = (status || '').toUpperCase();
  const config = STATUS_MAP[normalized] || { label: status || 'Unknown', bg: '#f1f5f9', color: '#334155' };
  const isPulsing = normalized === 'IN_PROGRESS' || normalized === 'PENDING';

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem',
        fontWeight: 600, backgroundColor: config.bg, color: config.color,
      }}
    >
      {isPulsing && (
        <span
          className="animate-pulse-dot"
          style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}

export default StatusBadge;

import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
  inline?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function Spinner({
  size = 'md',
  className = '',
  label = 'Loading...',
  inline = false,
}: SpinnerProps) {
  const icon = (
    <Loader2
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  );

  if (inline) {
    return (
      <span role="status" aria-label={label} className="inline-flex items-center gap-2">
        {icon}
        {label && <span className="text-sm text-slate-500 font-medium">{label}</span>}
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3 p-8"
    >
      {icon}
      {label && <span className="text-sm text-slate-500 font-medium">{label}</span>}
    </div>
  );
}

export default Spinner;

import React, { forwardRef, type ReactNode } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ style, variant = 'primary', ...props }, ref) => {
    const bg = variant === 'danger' ? '#dc2626' : variant === 'secondary' ? '#475569' : '#2563eb';
    return (
      <button
        ref={ref}
        style={{
          background: bg,
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.6 : 1,
          fontWeight: 500,
          ...style,
        }}
        {...props}
      />
    );
  },
);

export interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
      {label && <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{label}</label>}
      {children}
      {error && <span id={`${id}-error`} role="alert" style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</span>}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, style, ...props }, ref) => (
    <FormField id={id} label={label} error={error}>
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`, fontSize: '0.875rem', outline: 'none', ...style }}
        {...props}
      />
    </FormField>
  ),
);

export interface Option {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: string;
  error?: string;
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, error, options, style, ...props }, ref) => (
    <FormField id={id} label={label} error={error}>
      <select
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`, fontSize: '0.875rem', background: '#fff', ...style }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  ),
);

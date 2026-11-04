import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastItem { id: string; message: string; type: ToastType; }
export interface ToastContextValue { addToast: (message: string, type?: ToastType) => void; }

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: '1.25rem', right: '1.25rem',
          display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 9999,
        }}
      >
        {toasts.map((toast) => {
          const bg = toast.type === 'error' ? '#dc2626'
            : toast.type === 'success' ? '#16a34a'
            : toast.type === 'warning' ? '#d97706' : '#2563eb';
          return (
            <div
              key={toast.id}
              role="status"
              className="animate-slide-left"
              style={{
                backgroundColor: bg, color: '#fff', padding: '0.75rem 1.15rem',
                borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                minWidth: '220px', transition: 'all 0.2s ease',
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  return context || { addToast: () => {} };
}

import { useEffect, useRef, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal?.();
    } else {
      if (dialog.open) dialog.close?.();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="animate-zoom-in"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      style={{
        border: 'none', borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '1.5rem', maxWidth: '520px', width: '90%', background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer',
            color: '#64748b', transition: 'color 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          &times;
        </button>
      </div>
      <div>{children}</div>
    </dialog>
  );
}

export default Modal;

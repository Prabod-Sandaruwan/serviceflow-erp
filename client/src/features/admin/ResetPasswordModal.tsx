import { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button, Input } from '../../components/ui/Forms';
import { useResetPassword } from './hooks';
import { useToast } from '../../components/ui/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email: string } | null;
}

export function ResetPasswordModal({ isOpen, onClose, user }: Props) {
  const [password, setPassword] = useState('TempPass@2026!');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const resetPassword = useResetPassword();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setPassword('TempPass@2026!');
      setError('');
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) {
      setError('Temporary password must be at least 12 characters.');
      return;
    }
    if (password.toLowerCase() === user.email.toLowerCase()) {
      setError('Password cannot be the same as the user email.');
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: user.id, tempPassword: password });
      addToast(`Password reset successfully for ${user.email}`, 'success');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset User Password">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <p className="text-xs text-slate-600">
          Set a temporary password for <span className="font-semibold text-slate-900">{user.email}</span>. The user will be required to change it on their next login.
        </p>
        <div className="relative">
          <Input
            id="temp-password"
            label="Temporary Password (min 12 chars)"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
            title={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={resetPassword.isPending}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" disabled={resetPassword.isPending}>
            <KeyRound className="w-3.5 h-3.5 mr-1.5" />
            {resetPassword.isPending ? 'Resetting...' : 'Confirm Reset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ResetPasswordModal;

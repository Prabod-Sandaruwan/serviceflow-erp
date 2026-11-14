import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import type { User } from '../auth/types';

interface ProfileEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ user, isOpen, onClose }: ProfileEditModalProps) {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      const current = user?.employee?.fullName || (user?.employee as any)?.full_name || user?.fullName || '';
      setFullName(current);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setLoading(true);
    try {
      if (user?.employeeId) {
        await api.patch(`/employees/${user.employeeId}`, { fullName: fullName.trim() });
      }
      queryClient.setQueryData(['me'], (prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          fullName: fullName.trim(),
          employee: { ...(prev.employee || {}), fullName: fullName.trim(), full_name: fullName.trim() },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast('Profile updated successfully', 'success');
      onClose();
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-lg">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Legal Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sandaruwan Hapudeniya"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
            <input type="text" value={user?.email || ''} disabled className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500" />
            <p className="text-[11px] text-slate-400 mt-1">Enterprise credentials managed by organization policy.</p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

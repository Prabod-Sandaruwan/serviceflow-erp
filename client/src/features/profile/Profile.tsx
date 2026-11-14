import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ProfileCard } from './ProfileCard';
import { ProfileSupplementaryCards } from './ProfileSupplementaryCards';
import { ProfileEditModal } from './ProfileEditModal';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const rawName = user?.employee?.fullName || (user?.employee as any)?.full_name || user?.fullName;
  const fullName = rawName && rawName.trim() ? rawName.trim() : 'Not specified';
  const initials = (fullName !== 'Not specified' ? fullName : user?.email || 'AD')
    .slice(0, 2)
    .toUpperCase();

  const handleActivityLog = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/audit');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-2">
            User <span className="text-blue-600">Profile</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal account details and security settings</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleActivityLog}
            title={user?.role === 'ADMIN' ? 'View audit logs' : 'Audit logs available for admins'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Activity Log</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-2xs hover:bg-blue-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <ProfileCard user={user} fullName={fullName} initials={initials} onEditName={() => setIsEditOpen(true)} />
      <ProfileSupplementaryCards />
      <ProfileEditModal user={user} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}

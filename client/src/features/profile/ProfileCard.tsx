import type { User } from '../auth/types';
import { ProfileHeader } from './ProfileHeader';
import { ProfileFields } from './ProfileFields';
import { ProfileSecurityBar } from './ProfileSecurityBar';

interface ProfileCardProps {
  user: User | null;
  fullName: string;
  initials: string;
  onEditName: () => void;
}

export function ProfileCard({ user, fullName, initials, onEditName }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden relative" data-purpose="user-profile-card">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400" />
      <div className="p-6 md:p-8 space-y-6">
        <ProfileHeader user={user} fullName={fullName} initials={initials} />
        <ProfileFields user={user} fullName={fullName} onEditName={onEditName} />
        <ProfileSecurityBar user={user} />
      </div>
    </div>
  );
}

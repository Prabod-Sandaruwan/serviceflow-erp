import { Link } from "react-router-dom";
import { ShieldCheck, KeyRound } from "lucide-react";
import type { User } from "../auth/types";

interface ProfileSecurityBarProps {
  user: User | null;
}

export function ProfileSecurityBar({ user }: ProfileSecurityBarProps) {
  const accountId = user?.id
    ? `USR-${String(user.id).padStart(5, "0")}`
    : "USR-00001";
  const rawCreated = (user as any)?.created_at || (user as any)?.createdAt;
  const createdAtFormatted = rawCreated
    ? new Date(rawCreated).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Recently";
  const rawUpdated = (user as any)?.updated_at || (user as any)?.updatedAt;
  const updatedAtFormatted = rawUpdated
    ? new Date(rawUpdated).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : createdAtFormatted;

  return (
    <>
      <div
        className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        data-purpose="security-actions"
      >
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Security Credentials
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Password secured • Last profile activity on{" "}
            <span className="font-medium text-slate-700">
              {updatedAtFormatted}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Session Auth: Active</span>
          </div>
          <Link
            to="/profile/password"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40"
          >
            <KeyRound className="w-4 h-4 text-indigo-200" />
            <span>Change Password</span>
          </Link>
        </div>
      </div>

      <div className="bg-slate-50/70 border-t border-slate-100 -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 py-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 mt-6">
        <div className="flex items-center space-x-4">
          <span>
            Account ID:{" "}
            <code className="font-mono text-slate-700">{accountId}</code>
          </span>
          <span>•</span>
          <span>
            Timezone:{" "}
            <span className="text-slate-700">Asia/Colombo (GMT+5:30)</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Created on {createdAtFormatted}
        </div>
      </div>
    </>
  );
}

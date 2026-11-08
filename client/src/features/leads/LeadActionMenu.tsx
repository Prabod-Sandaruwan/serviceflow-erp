import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, ExternalLink, UserCheck, Pencil } from 'lucide-react';
import type { Lead } from './types';

export function LeadActionMenu({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const canConvert = lead.status !== 'CONVERTED' && lead.status !== 'LOST' && !lead.convertedClientId;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Lead actions"
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50 text-xs">
          <Link
            to={`/leads/${lead.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span>View Details</span>
          </Link>
          <Link
            to={`/leads/${lead.id}/edit`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-400" />
            <span>Edit Lead</span>
          </Link>
          {canConvert && (
            <Link
              to={`/leads/${lead.id}?convert=true`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 transition font-medium"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Convert to Client</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default LeadActionMenu;

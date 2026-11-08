import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, ExternalLink, UserX, UserCheck } from 'lucide-react';
import { useUpdateClient } from './clientMutations';
import type { Client } from './types';

export function ClientActionMenu({ client }: { client: Client }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: updateClient, isPending } = useUpdateClient();

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateClient({ id: client.id, isActive: !client.isActive });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Client actions"
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50 text-xs">
          <Link
            to={`/clients/${client.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span>View Details</span>
          </Link>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isPending}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left font-medium transition ${
              client.isActive
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {client.isActive ? (
              <>
                <UserX className="h-3.5 w-3.5" />
                <span>Mark as Inactive</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span>Mark as Active</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientActionMenu;

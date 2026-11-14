import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, UserX, UserCheck } from 'lucide-react';
import { useUpdateEmployee } from './hooks';

interface EmployeeActionMenuProps {
  employee: any;
  onEdit: (e: any) => void;
}

export function EmployeeActionMenu({ employee, onEdit }: EmployeeActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const updateEmp = useUpdateEmployee();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleStatus = async () => {
    setOpen(false);
    const newStatus = employee.isActive === false;
    await updateEmp.mutateAsync({ id: employee.id, isActive: newStatus });
  };

  const isActive = employee.isActive !== false;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        title="More actions"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-lg border border-slate-200/80 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(employee); }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Employee</span>
          </button>
          <button
            type="button"
            onClick={toggleStatus}
            className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2 ${
              isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {isActive ? (
              <>
                <UserX className="w-3.5 h-3.5 text-rose-500" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Activate</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default EmployeeActionMenu;


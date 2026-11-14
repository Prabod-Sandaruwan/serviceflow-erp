import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-200 transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

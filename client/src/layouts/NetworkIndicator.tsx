import { useContext } from 'react';
import { QueryClientContext, useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export function NetworkIndicator() {
  const client = useContext(QueryClientContext);
  if (!client) return null;
  return <NetworkActivityBadge />;
}

function NetworkActivityBadge() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  if (isFetching === 0 && isMutating === 0) return null;

  return (
    <div
      role="status"
      aria-label="Network activity in progress"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700 animate-fade-in"
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
      <span className="hidden sm:inline">Syncing...</span>
    </div>
  );
}

export default NetworkIndicator;

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useUpdateClient } from "./clientMutations";
import { useToast } from "../../components/ui/Toast";
import type { Client } from "./types";

export function ClientStatusToggle({ client }: { client: Client }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: updateClient, isPending } = useUpdateClient();
  const { addToast } = useToast();

  const handleToggle = () => {
    updateClient(
      { id: client.id, isActive: !client.isActive },
      {
        onSuccess: () => {
          addToast(
            client.isActive
              ? "Client marked as inactive"
              : "Client marked as active",
            "success",
          );
          setConfirmOpen(false);
        },
      },
    );
  };

  return (
    <div className="relative self-start sm:self-center">
      <button
        type="button"
        onClick={() => setConfirmOpen(!confirmOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>
      {confirmOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-xs">
          <p className="text-slate-700 font-medium mb-2">
            Mark client as inactive?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleToggle}
              className="px-2.5 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

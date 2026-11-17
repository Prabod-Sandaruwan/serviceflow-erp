import { useState } from "react";
import { useProjects } from "../projects/hooks";
import { useEmployees } from "../admin/hooks";
import { useMilestones } from "../milestones/hooks";
import { TaskCreateFields } from "./TaskCreateFields";
import { useTaskCreateForm } from "./useTaskCreateForm";

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskCreateModal({ isOpen, onClose }: TaskCreateModalProps) {
  const [projectSearch, setProjectSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const { data: projectsData } = useProjects({
    search: projectSearch.trim() || undefined,
    pageSize: 100,
  });
  const { data: empsData } = useEmployees(1, "", "", "true");
  const { data: msData } = useMilestones(projectId);

  const form = useTaskCreateForm(projectId, onClose);

  if (!isOpen) return null;

  const projects = projectsData?.data || [];
  const employees = empsData?.data || [];
  const milestones = (msData?.data || []).filter(
    (m: any) => m.status !== "CANCELLED",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            Create New Task
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        </div>
        <form onSubmit={form.handleSubmit} className="p-6 space-y-3">
          <TaskCreateFields
            projectId={projectId}
            setProjectId={setProjectId}
            projectSearch={projectSearch}
            setProjectSearch={setProjectSearch}
            title={form.title}
            setTitle={form.setTitle}
            priority={form.priority}
            setPriority={form.setPriority}
            assigneeId={form.assigneeId}
            setAssigneeId={form.setAssigneeId}
            milestoneId={form.milestoneId}
            setMilestoneId={form.setMilestoneId}
            dueDate={form.dueDate}
            setDueDate={form.setDueDate}
            description={form.description}
            setDescription={form.setDescription}
            projects={projects}
            employees={employees}
            milestones={milestones}
          />
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.createM.isPending}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {form.createM.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskCreateModal;

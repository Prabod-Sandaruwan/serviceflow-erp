import { TaskProjectSelect } from "./TaskProjectSelect";
import { TaskAssigneeMilestone } from "./TaskAssigneeMilestone";
import { TaskMetaFields } from "./TaskMetaFields";

interface TaskCreateFieldsProps {
  projectId: string;
  setProjectId: (v: string) => void;
  projectSearch?: string;
  setProjectSearch?: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  priority: string;
  setPriority: (v: string) => void;
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  milestoneId: string;
  setMilestoneId: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  projects: any[];
  employees: any[];
  milestones: any[];
}

export function TaskCreateFields(props: TaskCreateFieldsProps) {
  const {
    projectId,
    setProjectId,
    projectSearch = "",
    setProjectSearch,
    title,
    setTitle,
    priority,
    setPriority,
    assigneeId,
    setAssigneeId,
    milestoneId,
    setMilestoneId,
    dueDate,
    setDueDate,
    description,
    setDescription,
    projects,
    employees,
    milestones,
  } = props;

  return (
    <div className="space-y-3">
      <TaskProjectSelect
        projectId={projectId}
        setProjectId={setProjectId}
        projectSearch={projectSearch}
        setProjectSearch={setProjectSearch}
        setMilestoneId={setMilestoneId}
        projects={projects}
      />
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Title *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Architecture Blueprint"
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
        />
      </div>
      <TaskAssigneeMilestone
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
        milestoneId={milestoneId}
        setMilestoneId={setMilestoneId}
        projectId={projectId}
        employees={employees}
        milestones={milestones}
      />
      <TaskMetaFields
        priority={priority}
        setPriority={setPriority}
        dueDate={dueDate}
        setDueDate={setDueDate}
        description={description}
        setDescription={setDescription}
      />
    </div>
  );
}

export default TaskCreateFields;

interface TaskMetaFieldsProps {
  priority: string;
  setPriority: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

export function TaskMetaFields({
  priority,
  setPriority,
  dueDate,
  setDueDate,
  description,
  setDescription,
}: TaskMetaFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional details..."
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
        />
      </div>
    </>
  );
}

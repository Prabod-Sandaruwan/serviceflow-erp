import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Task, TasksResponse } from "./types";

export async function downloadAllTasksCsv(fallbackTasks: Task[] = []) {
  let tasks = fallbackTasks;
  try {
    const res = await api.get<TasksResponse>("/tasks?pageSize=100&page=1");
    if (res?.data && res.data.length > 0) {
      tasks = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<TasksResponse>(
          `/tasks?pageSize=100&page=${p}`,
        );
        if (next?.data?.length) tasks.push(...next.data);
      }
    }
  } catch {
    // fallback to provided tasks
  }

  const headers = [
    "Task ID",
    "Title",
    "Priority",
    "Status",
    "Assignee",
    "Due Date",
    "Project ID",
    "Created At",
  ];
  const rows = tasks.map((t) => [
    t.id,
    t.title,
    t.priority,
    t.status,
    t.assignee?.fullName || "",
    t.dueDate || "-",
    t.projectId || "",
    t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",
  ]);

  downloadCsv(
    `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllTasksCsv;

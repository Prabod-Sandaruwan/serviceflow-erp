import { useState } from "react";
import { useCreateTask } from "./hooks";
import { useToast } from "../../components/ui/Toast";

export function useTaskCreateForm(projectId: string, onClose: () => void) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const createM = useCreateTask(projectId);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      addToast("Please select a project", "error");
      return;
    }
    if (!title.trim()) {
      addToast("Task title is required", "error");
      return;
    }
    try {
      await createM.mutateAsync({
        title: title.trim(),
        priority,
        assigneeId: assigneeId || null,
        milestoneId: milestoneId || null,
        dueDate: dueDate || null,
        description: description.trim() || null,
      });
      addToast("Task created successfully", "success");
      onClose();
    } catch {
      addToast("Failed to create task", "error");
    }
  };

  return {
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
    createM,
    handleSubmit,
  };
}

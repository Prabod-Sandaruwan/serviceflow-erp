import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useCreateTask, useUpdateTask } from './hooks';
import type { Task } from './types';

const PRIORITIES = [
  { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
];
const STATUSES = [
  { value: 'TODO', label: 'To Do' }, { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }, { value: 'CANCELLED', label: 'Cancelled' },
];

export interface TaskFormProps {
  task?: Task | null;
  projectId: string;
  milestones?: Array<{ id: string; title?: string; name?: string }>;
  employees?: Array<{ id: string; fullName: string }>;
  onClose: () => void;
}

export function TaskForm({ task, projectId, milestones = [], employees = [], onClose }: TaskFormProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isStaff = user?.role === 'STAFF';
  const isEdit = Boolean(task?.id);
  const createM = useCreateTask(projectId);
  const updateM = useUpdateTask(projectId);
  const isPending = createM.isPending || updateM.isPending;

  const defaultValues = {
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'TODO',
    assigneeId: task?.assigneeId || '',
    milestoneId: task?.milestoneId || '',
    dueDate: task?.dueDate || '',
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => { reset(defaultValues); }, [task?.id]);

  const onSubmit = async (values: any) => {
    try {
      const sanitized = {
        title: values.title,
        description: values.description?.trim() || null,
        priority: values.priority || 'MEDIUM',
        status: values.status || 'TODO',
        assigneeId: values.assigneeId || null,
        milestoneId: values.milestoneId || null,
        dueDate: values.dueDate || null,
      };
      if (isEdit && task) {
        await updateM.mutateAsync({ id: task.id, data: isStaff ? { status: values.status } : sanitized });
        addToast('Task updated successfully', 'success');
      } else {
        await createM.mutateAsync(sanitized);
        addToast('Task created successfully', 'success');
      }
      onClose();
    } catch (e: any) {
      addToast(e?.message || 'Failed to save task', 'error');
    }
  };

  const msList = task?.milestone && !milestones.some((m: any) => String(m.id) === String(task.milestone?.id))
    ? [task.milestone as any, ...milestones]
    : milestones;
  const msOptions = [{ value: '', label: 'None' }, ...msList.map((m: any) => ({ value: String(m.id), label: m.title || m.name || `Milestone ${m.id}` }))];

  const empList = task?.assignee && !employees.some((e: any) => String(e.id) === String(task.assignee?.id))
    ? [{ id: String(task.assignee.id), fullName: task.assignee.fullName }, ...employees]
    : employees;
  const empOptions = [{ value: '', label: 'Unassigned' }, ...empList.map((e: any) => ({ value: e.id, label: e.fullName }))];

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Input id="task-title" label="Title" disabled={isStaff} error={errors.title?.message} {...register('title', { required: !isStaff && 'Title is required' })} />
      <Input id="task-desc" label="Description" disabled={isStaff} {...register('description')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select id="task-priority" label="Priority" options={PRIORITIES} disabled={isStaff} {...register('priority')} />
        <Select id="task-status" label="Status" options={STATUSES} {...register('status')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select id="task-assignee" label="Assignee" options={empOptions} disabled={isStaff} {...register('assigneeId')} />
        <Select id="task-milestone" label="Milestone" options={msOptions} disabled={isStaff} {...register('milestoneId')} />
      </div>
      <Input id="task-due-date" label="Due Date" type="date" disabled={isStaff} {...register('dueDate')} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}</Button>
      </div>
    </form>
  );
}

export default TaskForm;

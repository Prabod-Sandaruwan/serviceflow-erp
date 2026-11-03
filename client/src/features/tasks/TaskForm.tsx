import { useForm } from 'react-hook-form';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useCreateTask, useUpdateTask } from './hooks';
import type { Task } from './types';

interface Option { value: string; label: string }
const PRIORITIES: Option[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];
const STATUSES: Option[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export interface TaskFormProps {
  task?: Task | null;
  projectId: string;
  milestones?: Array<{ id: string; title: string }>;
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

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      status: task?.status || 'TODO',
      assigneeId: task?.assigneeId || '',
      milestoneId: task?.milestoneId || '',
      dueDate: task?.dueDate || '',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      if (isEdit && task) {
        const payload = isStaff ? { status: values.status } : values;
        await updateM.mutateAsync({ id: task.id, data: payload });
        addToast('Task updated successfully', 'success');
      } else {
        await createM.mutateAsync(values);
        addToast('Task created successfully', 'success');
      }
      onClose();
    } catch (e: any) {
      addToast(e?.message || 'Failed to save task', 'error');
    }
  };

  const msOptions = [{ value: '', label: 'None' }, ...milestones.map((m) => ({ value: m.id, label: m.title }))];
  const empOptions = [{ value: '', label: 'Unassigned' }, ...employees.map((e) => ({ value: e.id, label: e.fullName }))];

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

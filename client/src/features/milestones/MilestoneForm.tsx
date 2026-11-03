import { useForm } from 'react-hook-form';
import { useToast } from '../../components/ui/Toast';
import { Input, Button } from '../../components/ui/Forms';
import { useCreateMilestone } from './hooks';

export interface MilestoneFormProps {
  projectId: string;
  onClose: () => void;
}

export function MilestoneForm({ projectId, onClose }: MilestoneFormProps) {
  const { addToast } = useToast();
  const createM = useCreateMilestone(projectId);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      billingAmount: '',
      dueDate: '',
      description: '',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await createM.mutateAsync({
        title: values.title.trim(),
        billingAmount: values.billingAmount ? String(values.billingAmount) : '0',
        dueDate: values.dueDate || undefined,
        description: values.description?.trim() || undefined,
      });
      addToast('Milestone created successfully', 'success');
      onClose();
    } catch (e: any) {
      addToast(e?.message || 'Failed to create milestone', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Input
        id="milestone-title"
        label="Milestone Title"
        error={errors.title?.message}
        {...register('title', { required: 'Milestone title is required' })}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          id="milestone-billing-amount"
          label="Billing Amount ($)"
          type="number"
          step="0.01"
          min="0"
          error={errors.billingAmount?.message}
          {...register('billingAmount', {
            validate: (v) => !v || Number(v) >= 0 || 'Amount must be positive',
          })}
        />
        <Input
          id="milestone-due-date"
          label="Due Date"
          type="date"
          {...register('dueDate')}
        />
      </div>
      <Input
        id="milestone-description"
        label="Description (Optional)"
        {...register('description')}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={createM.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={createM.isPending}>
          {createM.isPending ? 'Creating...' : 'Create Milestone'}
        </Button>
      </div>
    </form>
  );
}

export default MilestoneForm;

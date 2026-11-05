import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLead, useCreateLead, useUpdateLead } from './hooks';
import { leadFormSchema, getValidNextStatuses, type LeadFormData } from './schemas';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { QueryBoundary } from '../../components/states/QueryBoundary';

export default function LeadFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const leadQuery = useLead(id);
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useZodForm(leadFormSchema, {
    defaultValues: { title: '', clientId: '', estimatedValue: 0, status: 'NEW', lostReason: '', notes: '' },
  });
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = form;
  const currentStatus = watch('status');
  const serverStatus = leadQuery.data?.data?.status;

  useEffect(() => {
    if (leadQuery.data?.data) {
      const l = leadQuery.data.data;
      reset({
        title: l.title || `Lead #${l.id}`,
        clientId: l.convertedClientId || '',
        estimatedValue: l.expectedValue ?? null,
        status: l.status || 'NEW',
        lostReason: l.lostReason || '',
        notes: l.notes || '',
      });
    }
  }, [leadQuery.data, reset]);

  const onSubmit = async (values: LeadFormData) => {
    try {
      setGlobalError(null);
      const payload: any = {
        status: values.status,
        expectedValue: values.estimatedValue != null ? Number(values.estimatedValue) : undefined,
        notes: values.notes,
        lostReason: values.status === 'LOST' ? values.lostReason : undefined,
      };
      const res = isEdit && id ? await updateMutation.mutateAsync({ id, ...payload }) : await createMutation.mutateAsync(payload);
      addToast(isEdit ? 'Lead updated' : 'Lead created', 'success');
      navigate(`/leads/${res.data.id}`);
    } catch (err) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  const statusOptions = getValidNextStatuses(isEdit ? serverStatus : 'NEW');

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {globalError && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 }}>{globalError}</div>}
      <Input id="title" label="Lead Title" placeholder="e.g. Acme Enterprise ERP rollout" error={errors.title?.message} {...register('title')} />
      <Input id="estimatedValue" label="Estimated Value ($)" type="number" step="0.01" error={errors.estimatedValue?.message} {...register('estimatedValue')} />
      {isEdit && (
        <Select id="status" label="Pipeline Status" options={statusOptions} error={errors.status?.message} {...register('status')} />
      )}
      {currentStatus === 'LOST' && (
        <Input id="lostReason" label="Lost Reason" placeholder="Describe why this opportunity was lost..." error={errors.lostReason?.message} {...register('lostReason')} />
      )}
      <Input id="notes" label="Notes" placeholder="Additional context..." error={errors.notes?.message} {...register('notes')} />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Lead'}</Button>
        <Link to={isEdit && id ? `/leads/${id}` : '/leads'} style={{ textDecoration: 'none' }}><Button type="button" variant="secondary" style={{ borderRadius: '8px' }}>Cancel</Button></Link>
      </div>
    </form>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>{isEdit ? 'Edit Lead' : 'New Lead'}</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{isEdit ? 'Update lead progression and pipeline status' : 'Record a new prospective sales deal'}</p>
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.75rem' }}>
        {isEdit ? <QueryBoundary query={leadQuery}>{formContent}</QueryBoundary> : formContent}
      </div>
    </div>
  );
}

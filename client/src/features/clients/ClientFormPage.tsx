import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClient, useCreateClient, useUpdateClient } from './hooks';
import { clientSchema, type ClientFormData } from './schemas';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { QueryBoundary } from '../../components/states/QueryBoundary';

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const clientQuery = useClient(id);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useZodForm(clientSchema, {
    defaultValues: { clientType: 'BUSINESS', displayName: '', email: '', phone: '', address: '', contactPerson: '', registrationNumber: '' },
  });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    if (clientQuery.data?.data) {
      const c = clientQuery.data.data;
      reset({
        clientType: c.clientType === 'COMPANY' || c.clientType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
        displayName: c.displayName || '',
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        contactPerson: c.contactPerson || '',
        registrationNumber: c.registrationNumber || '',
      });
    }
  }, [clientQuery.data, reset]);

  const onSubmit = async (values: ClientFormData) => {
    try {
      setGlobalError(null);
      const res = isEdit && id ? await updateMutation.mutateAsync({ id, ...values }) : await createMutation.mutateAsync(values);
      if (res.duplicateWarning) {
        setDupWarning('Notice: A client with matching email or registration already exists.');
        addToast('Duplicate email or registration detected (not blocked).', 'info');
      } else {
        addToast(isEdit ? 'Client updated' : 'Client created', 'success');
      }
      navigate(`/clients/${res.data.id}`);
    } catch (err) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {dupWarning && <div role="alert" style={{ background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 }}>{dupWarning}</div>}
      {globalError && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 }}>{globalError}</div>}
      <Select id="clientType" label="Client Type" options={[{ value: 'BUSINESS', label: 'Business / Company' }, { value: 'INDIVIDUAL', label: 'Individual' }]} error={errors.clientType?.message} {...register('clientType')} />
      <Input id="displayName" label="Client / Company Name" error={errors.displayName?.message} {...register('displayName')} />
      <Input id="email" label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
      <Input id="phone" label="Phone Number" error={errors.phone?.message} {...register('phone')} />
      <Input id="contactPerson" label="Contact Person" error={errors.contactPerson?.message} {...register('contactPerson')} />
      <Input id="registrationNumber" label="Registration Number" error={errors.registrationNumber?.message} {...register('registrationNumber')} />
      <Input id="address" label="Address" error={errors.address?.message} {...register('address')} />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Client'}</Button>
        <Link to={isEdit && id ? `/clients/${id}` : '/clients'} style={{ textDecoration: 'none' }}><Button type="button" variant="secondary" style={{ borderRadius: '8px' }}>Cancel</Button></Link>
      </div>
    </form>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>{isEdit ? 'Edit Client' : 'New Client'}</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{isEdit ? 'Update client details and contact information' : 'Create a new business or individual client profile'}</p>
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.75rem' }}>
        {isEdit ? <QueryBoundary query={clientQuery}>{formContent}</QueryBoundary> : formContent}
      </div>
    </div>
  );
}

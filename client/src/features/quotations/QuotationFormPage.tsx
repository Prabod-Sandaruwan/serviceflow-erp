import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuotation, useCreateQuotation, useUpdateQuotation } from './hooks';
import { useClients } from '../clients/hooks';
import { quotationFormSchema, type QuotationFormData } from './schemas';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { calculateQuotationTotals } from '../../lib/money';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import ItemEditor from './ItemEditor';

export default function QuotationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const quotationQuery = useQuotation(id), clientsQuery = useClients({ page: '1' });
  const createMutation = useCreateQuotation(), updateMutation = useUpdateQuotation();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useZodForm(quotationFormSchema, {
    defaultValues: { clientId: '', leadId: '', title: '', validUntil: '', taxAmount: '0.00', notes: '', items: [{ description: '', quantity: '1', unitPrice: '0.00' }] },
  });
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = form;
  const quotation = quotationQuery.data?.data;
  const isLocked = isEdit && Boolean(quotation && quotation.status !== 'DRAFT');

  useEffect(() => {
    if (quotation) {
      reset({
        clientId: quotation.clientId || '', leadId: quotation.leadId || '', title: quotation.title || '',
        validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
        taxAmount: String(quotation.taxAmount ?? '0.00'), notes: quotation.notes || '',
        items: (quotation.items || []).map((it) => ({
          description: it.description, quantity: String(it.quantity), unitPrice: String(it.unitPrice),
        })),
      });
    }
  }, [quotation, reset]);

  const totals = calculateQuotationTotals(watch('items') || [], watch('taxAmount') || '0.00');

  const onSubmit = async (values: QuotationFormData) => {
    try {
      setGlobalError(null);
      const items = values.items.map((it) => ({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) }));
      const tax = { type: 'NONE', rate: 0, amount: Number(values.taxAmount || '0') };
      const payload = { ...values, leadId: values.leadId || undefined, items, tax };
      const res = isEdit && id
        ? await updateMutation.mutateAsync({ id, title: values.title, validUntil: values.validUntil, items, tax, notes: values.notes })
        : await createMutation.mutateAsync(payload);
      addToast(isEdit ? 'Quotation updated' : 'Quotation created', 'success');
      navigate(`/quotations/${res.data.id}`);
    } catch (err) { setGlobalError(applyApiErrors(form, err)); }
  };

  const clientOpts = [{ value: '', label: '-- Select Client (or enter ID) --' }, ...(clientsQuery.data?.data || []).map((c) => ({ value: c.id, label: `${c.displayName} (${c.clientType})` }))];

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {isLocked && <div role="alert" style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Notice: This quotation is in {quotation?.status} status and is locked. Only DRAFT quotations can be edited.</div>}
      {globalError && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500 }}>{globalError}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        <Select id="clientSelect" label="Select Client" options={clientOpts} disabled={isLocked || isEdit} onChange={(e) => { if (e.target.value) setValue('clientId', e.target.value, { shouldValidate: true }); }} />
        <Input id="clientId" label="Client ID" placeholder="Client ID" list="client-datalist" error={errors.clientId?.message} disabled={isLocked || isEdit} {...register('clientId')} />
        <datalist id="client-datalist">{(clientsQuery.data?.data || []).map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}</datalist>
      </div>
      <Input id="title" label="Quotation Title" placeholder="e.g. Website Revamp & Maintenance" error={errors.title?.message} disabled={isLocked} {...register('title')} />
      <Input id="validUntil" label="Valid Until" type="date" error={errors.validUntil?.message} disabled={isLocked} {...register('validUntil')} />
      <ItemEditor control={control as any} register={register} errors={errors} disabled={isLocked} />
      <Input id="taxAmount" label="Tax Amount ($)" type="number" step="0.01" error={errors.taxAmount?.message} disabled={isLocked} {...register('taxAmount')} />
      <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
        <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Live Running Estimate</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal estimate:</span><span>${totals.subtotal}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax estimate:</span><span>${totals.taxAmount}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #cbd5e1', paddingTop: '0.3rem', marginTop: '0.3rem' }}><span>Total estimate:</span><span data-testid="total-estimate">${totals.total}</span></div>
      </div>
      <Input id="notes" label="Notes" placeholder="Optional notes..." error={errors.notes?.message} disabled={isLocked} {...register('notes')} />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Button type="submit" disabled={isSubmitting || isLocked} style={{ background: isLocked ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '8px', fontWeight: 600 }}>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Quotation'}</Button>
        <Link to="/quotations" style={{ textDecoration: 'none' }}><Button type="button" variant="secondary" style={{ borderRadius: '8px' }}>Cancel</Button></Link>
      </div>
    </form>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 1.25rem', fontSize: '1.75rem', fontWeight: 800 }}>{isEdit ? 'Edit Quotation' : 'New Quotation'}</h1>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        {isEdit ? <QueryBoundary query={quotationQuery}>{formContent}</QueryBoundary> : formContent}
      </div>
    </div>
  );
}
export { QuotationFormPage };

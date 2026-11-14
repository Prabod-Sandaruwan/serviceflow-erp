import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useInvoice, useCreateInvoice, useUpdateInvoice } from './hooks';
import { useMilestone } from '../milestones/hooks';
import { Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { InvoiceItemEditor } from './InvoiceItemEditor';
import { InvoiceMilestonePicker } from './InvoiceMilestonePicker';
import { InvoiceTaxFields } from './InvoiceTaxFields';

export default function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const paramMilestoneId = searchParams.get('milestoneId') || '';
  const [pickedMilestone, setPickedMilestone] = useState<any>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isEdit = Boolean(id);
  const invoice = useInvoice(id).data?.data;
  const urlMilestone = useMilestone(paramMilestoneId).data?.data;
  const activeMilestone = urlMilestone || pickedMilestone;
  const createM = useCreateInvoice();
  const updateM = useUpdateInvoice();
  const isDraft = !isEdit || invoice?.status === 'DRAFT';
  const disabled = isEdit ? !isDraft : false;

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      taxType: '', taxAmount: '0.00', taxReference: '', dueDate: '',
      items: [{ description: '', amount: '0.00' }],
    },
  });

  useEffect(() => {
    if (isEdit && invoice) {
      reset({
        taxType: invoice.taxType || '', taxAmount: invoice.taxAmount || '0.00',
        taxReference: invoice.taxReference || '', dueDate: invoice.dueDate || '',
        items: invoice.items?.length ? invoice.items.map((i) => ({ description: i.description, amount: i.lineAmount })) : [{ description: '', amount: '0.00' }],
      });
    } else if (!isEdit && activeMilestone) {
      reset({
        taxType: '', taxAmount: '0.00', taxReference: '', dueDate: '',
        items: [{ description: activeMilestone.title, amount: String(activeMilestone.billingAmount || '0.00') }],
      });
    }
  }, [isEdit, invoice, activeMilestone, reset]);

  const onSubmit = async (values: any) => {
    try {
      if (isEdit && id) {
        await updateM.mutateAsync({ id, ...values });
        addToast('Invoice updated successfully', 'success');
        navigate(`/invoices/${id}`);
      } else {
        const milestoneId = paramMilestoneId || pickedMilestone?.id;
        if (!milestoneId) { addToast('Please select an approved milestone to create an invoice', 'error'); return; }
        const cleanItems = (values.items || []).filter((it: any) => it.description?.trim()).map((it: any) => ({ description: it.description.trim(), amount: String(it.amount || '0.00') }));
        if (cleanItems.length === 0) { addToast('At least one item with a description is required', 'error'); return; }
        const res = await createM.mutateAsync({ milestoneId, items: cleanItems, taxType: values.taxType || undefined, taxAmount: values.taxAmount ? String(values.taxAmount) : '0', taxReference: values.taxReference?.trim() || undefined, dueDate: values.dueDate?.trim() || undefined });
        addToast('Invoice created successfully', 'success');
        navigate(`/invoices/${res.data.id}`);
      }
    } catch (e: any) { addToast(e?.message || 'Failed to save invoice', 'error'); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/invoices" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>&larr; Back to Invoices</Link>
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 800 }} className="page-title-gradient">
          {isEdit ? `Edit Invoice ${invoice?.invoiceNumber || ''}` : 'New Invoice'}
        </h1>
        {isEdit && !isDraft && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            This invoice is {invoice?.status} and cannot be modified.
          </div>
        )}
        {!isEdit && !paramMilestoneId && <InvoiceMilestonePicker selectedMilestoneId={pickedMilestone?.id} onSelect={(m) => setPickedMilestone(m)} disabled={disabled} />}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InvoiceItemEditor control={control} register={register} disabled={disabled} expectedBillingAmount={isEdit ? null : activeMilestone?.billingAmount} />
          <InvoiceTaxFields register={register} disabled={disabled} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/invoices')}>Cancel</Button>
            <Button type="submit" disabled={disabled || createM.isPending || updateM.isPending} style={{ background: '#4f46e5' }}>
              {isEdit ? 'Save Changes' : 'Create Draft Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

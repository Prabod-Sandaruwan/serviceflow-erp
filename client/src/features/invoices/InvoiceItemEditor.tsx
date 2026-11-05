import { useFieldArray, useWatch } from 'react-hook-form';
import { Button, Input } from '../../components/ui/Forms';

export interface InvoiceItemEditorProps {
  control: any;
  register: any;
  disabled?: boolean;
  expectedBillingAmount?: string | number | null;
}

export function InvoiceItemEditor({ control, register, disabled, expectedBillingAmount }: InvoiceItemEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' }) || [];
  const subtotal = watchedItems.reduce((acc: number, it: any) => acc + (Number(it?.amount) || 0), 0);
  const expectedNum = expectedBillingAmount != null ? Number(expectedBillingAmount) : null;
  const isMismatch = expectedNum != null && Math.abs(subtotal - expectedNum) > 0.001;

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Invoice Items</label>
        <Button
          type="button"
          disabled={disabled}
          onClick={() => append({ description: '', amount: '0.00' })}
          style={{ background: '#4f46e5', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          + Add Item
        </Button>
      </div>

      {isMismatch && (
        <div data-testid="amount-mismatch-warning" style={{ background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 500 }}>
          Warning: Items subtotal (${subtotal.toFixed(2)}) does not match milestone billing amount (${expectedNum.toFixed(2)}).
        </div>
      )}

      {fields.length === 0 ? (
        <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.875rem' }}>
          No items added. Click "+ Add Item" above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {fields.map((field, idx) => (
            <div key={field.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 3 }}>
                <Input id={`items.${idx}.description`} placeholder="Description" disabled={disabled} {...register(`items.${idx}.description` as const, { required: true })} />
              </div>
              <div style={{ flex: 1.5, minWidth: '120px' }}>
                <Input id={`items.${idx}.amount`} placeholder="Amount" type="number" step="0.01" disabled={disabled} {...register(`items.${idx}.amount` as const, { required: true })} />
              </div>
              <Button type="button" variant="danger" disabled={disabled || fields.length <= 1} onClick={() => remove(idx)} style={{ marginTop: '0.2rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                &times;
              </Button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
        <span>Subtotal: ${subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default InvoiceItemEditor;

import { useFieldArray, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { Button, Input } from '../../components/ui/Forms';

export interface ItemEditorProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  disabled?: boolean;
}

export function ItemEditor({ control, register, errors, disabled = false }: ItemEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const itemsError = errors?.items?.message || (errors?.items as any)?.root?.message;

  return (
    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Quotation Items</label>
        <Button
          type="button"
          disabled={disabled}
          onClick={() => append({ description: '', quantity: '1', unitPrice: '0.00' })}
          style={{ background: '#4f46e5', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          + Add Item
        </Button>
      </div>

      {itemsError && (
        <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 500 }}>
          {String(itemsError)}
        </div>
      )}

      {fields.length === 0 ? (
        <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.875rem' }}>
          No items added. Click "+ Add Item" above to add line items.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {fields.map((field, index) => {
            const err = (errors?.items as any)?.[index];
            return (
              <div key={field.id} data-testid="item-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 3 }}>
                  <Input id={`items.${index}.description`} placeholder="Description" error={err?.description?.message} disabled={disabled} {...register(`items.${index}.description` as const)} />
                </div>
                <div style={{ flex: 1, minWidth: '80px' }}>
                  <Input id={`items.${index}.quantity`} placeholder="Qty" type="number" step="any" error={err?.quantity?.message} disabled={disabled} {...register(`items.${index}.quantity` as const)} />
                </div>
                <div style={{ flex: 1.5, minWidth: '100px' }}>
                  <Input id={`items.${index}.unitPrice`} placeholder="Unit Price" type="number" step="0.01" error={err?.unitPrice?.message} disabled={disabled} {...register(`items.${index}.unitPrice` as const)} />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  style={{ marginTop: '0.2rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ItemEditor;

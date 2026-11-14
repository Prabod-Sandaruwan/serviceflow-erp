import { Input, Select } from '../../components/ui/Forms';

export const TAX_TYPES = [
  { value: '', label: 'None' },
  { value: 'VAT', label: 'VAT' },
  { value: 'NBT', label: 'NBT' },
  { value: 'SVAT', label: 'SVAT' },
];

export interface InvoiceTaxFieldsProps {
  register: any;
  disabled?: boolean;
}

export function InvoiceTaxFields({ register, disabled }: InvoiceTaxFieldsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
      <Select id="taxType" label="Tax Type" options={TAX_TYPES} disabled={disabled} {...register('taxType')} />
      <Input id="taxAmount" label="Tax Amount" type="number" step="0.01" disabled={disabled} {...register('taxAmount')} />
      <Input id="taxReference" label="Tax Reference" disabled={disabled} {...register('taxReference')} />
      <Input id="dueDate" label="Due Date" type="date" disabled={disabled} {...register('dueDate')} />
    </div>
  );
}

export default InvoiceTaxFields;

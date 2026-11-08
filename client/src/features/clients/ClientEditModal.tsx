import { useState } from 'react';
import { X } from 'lucide-react';
import { useUpdateClient } from './clientMutations';
import { clientSchema, type ClientFormData } from './schemas';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import type { Client } from './types';

interface ClientEditModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientEditModal({ client, isOpen, onClose }: ClientEditModalProps) {
  const { addToast } = useToast();
  const updateMutation = useUpdateClient();
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useZodForm(clientSchema, {
    defaultValues: {
      clientType: client.clientType === 'COMPANY' || client.clientType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
      displayName: client.displayName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      contactPerson: client.contactPerson || '',
      registrationNumber: client.registrationNumber || '',
    },
  });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  if (!isOpen) return null;

  const onSubmit = async (values: ClientFormData) => {
    try {
      setGlobalError(null);
      const res = await updateMutation.mutateAsync({ id: client.id, ...values });
      if (res.duplicateWarning) {
        setDupWarning('Notice: A client with matching email or registration already exists.');
        addToast('Duplicate email or registration detected (not blocked).', 'info');
      } else {
        addToast('Client details updated successfully', 'success');
        onClose();
      }
    } catch (err) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-base font-bold text-slate-900">Edit Client Details</h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          {dupWarning && <div role="alert" className="p-2.5 rounded-lg bg-amber-50 text-amber-800 text-xs">{dupWarning}</div>}
          {globalError && <div role="alert" className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs">{globalError}</div>}
          <Select id="clientType" label="Client Type" options={[{ value: 'BUSINESS', label: 'Business / Company' }, { value: 'INDIVIDUAL', label: 'Individual' }]} error={errors.clientType?.message} {...register('clientType')} />
          <Input id="displayName" label="Client / Company Name" error={errors.displayName?.message} {...register('displayName')} />
          <Input id="email" label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
          <Input id="phone" label="Phone Number" error={errors.phone?.message} {...register('phone')} />
          <Input id="contactPerson" label="Contact Person" error={errors.contactPerson?.message} {...register('contactPerson')} />
          <Input id="registrationNumber" label="Registration Number" error={errors.registrationNumber?.message} {...register('registrationNumber')} />
          <Input id="address" label="Address" error={errors.address?.message} {...register('address')} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} style={{ borderRadius: '8px' }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} style={{ background: '#2563eb', borderRadius: '8px', fontWeight: 600 }}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientEditModal;

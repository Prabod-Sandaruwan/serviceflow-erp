import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { useCreateEmployee, useUpdateEmployee } from './hooks';

export const employeeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  jobTitle: z.string().min(1, 'Job title is required'),
  phone: z.string().optional(),
  isActive: z.string().optional(),
});

export interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
}

export function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  const createEmp = useCreateEmployee();
  const updateEmp = useUpdateEmployee();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useZodForm(employeeSchema, {
    defaultValues: {
      fullName: employee?.fullName || '',
      email: employee?.email || '',
      jobTitle: employee?.jobTitle || '',
      phone: employee?.phone || '',
      isActive: employee ? String(employee.isActive !== false) : 'true',
    },
  });

  useEffect(() => {
    form.reset({
      fullName: employee?.fullName || '',
      email: employee?.email || '',
      jobTitle: employee?.jobTitle || '',
      phone: employee?.phone || '',
      isActive: employee ? String(employee.isActive !== false) : 'true',
    });
  }, [employee]);

  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    setGlobalError(null);
    try {
      if (employee) {
        await updateEmp.mutateAsync({
          id: employee.id,
          ...data,
          isActive: data.isActive === 'true',
        });
      } else {
        await createEmp.mutateAsync({
          ...data,
          isActive: true,
        });
      }
      onClose();
    } catch (err) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'}>
      {globalError && <div role="alert" style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{globalError}</div>}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Input id="fullName" label="Full Name" error={form.formState.errors.fullName?.message} {...form.register('fullName')} />
        <Input id="email" label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input id="jobTitle" label="Job Title" error={form.formState.errors.jobTitle?.message} {...form.register('jobTitle')} />
        <Input id="phone" label="Phone" error={form.formState.errors.phone?.message} {...form.register('phone')} />
        {employee && <Select id="isActive" label="Status" options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} error={form.formState.errors.isActive?.message} {...form.register('isActive')} />}
        <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', marginTop: '1rem' }}>
          {employee ? 'Save Changes' : 'Add Employee'}
        </Button>
      </form>
    </Modal>
  );
}

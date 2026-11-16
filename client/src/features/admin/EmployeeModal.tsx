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
  department: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
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

  const getVals = (e?: any) => ({
    fullName: e?.fullName || e?.full_name || '',
    email: e?.email || '',
    jobTitle: e?.jobTitle || e?.job_title || '',
    department: e?.department || '',
    phone: e?.phone || '',
    role: e?.role || 'STAFF',
    isActive: e ? String(e.isActive !== false) : 'true',
  });

  const form = useZodForm(employeeSchema, { defaultValues: getVals(employee) });
  useEffect(() => { form.reset(getVals(employee)); }, [employee]);

  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    setGlobalError(null);
    try {
      if (employee) {
        await updateEmp.mutateAsync({ id: employee.id, ...data, isActive: data.isActive === 'true' });
      } else {
        await createEmp.mutateAsync({ ...data, isActive: true });
      }
      onClose();
    } catch (err) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  const ROLES = [{ value: 'ADMIN', label: 'Admin' }, { value: 'MANAGER', label: 'Manager' }, { value: 'STAFF', label: 'Staff' }];
  const STATUSES = [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'}>
      {globalError && <div role="alert" className="p-3 mb-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">{globalError}</div>}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
        <Input id="fullName" label="Full Name" error={form.formState.errors.fullName?.message} {...form.register('fullName')} />
        <Input id="email" label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <div className="grid grid-cols-2 gap-3">
          <Input id="jobTitle" label="Job Title" error={form.formState.errors.jobTitle?.message} {...form.register('jobTitle')} />
          <Input id="department" label="Department" error={form.formState.errors.department?.message} {...form.register('department')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="phone" label="Phone" error={form.formState.errors.phone?.message} {...form.register('phone')} />
          <Select id="role" label="Role" options={ROLES} error={form.formState.errors.role?.message} {...form.register('role')} />
        </div>
        {employee && <Select id="isActive" label="Status" options={STATUSES} error={form.formState.errors.isActive?.message} {...form.register('isActive')} />}
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
          {employee ? 'Save Changes' : 'Add Employee'}
        </Button>
      </form>
    </Modal>
  );
}

export default EmployeeModal;

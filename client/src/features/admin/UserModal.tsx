import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Button } from '../../components/ui/Forms';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { useCreateUser, useUpdateUser } from './hooks';

const schema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(1, 'Required').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
  password: z.string().optional(),
  isActive: z.string().optional(),
});

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isSelf: boolean;
}

export function UserModal({ isOpen, onClose, user, isSelf }: UserModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const form = useZodForm(schema, {
    defaultValues: {
      email: user?.email || '',
      fullName: user?.fullName || user?.employee?.fullName || '',
      role: user?.role || 'STAFF',
      isActive: user ? String(user.isActive !== false) : 'true',
    },
  });

  useEffect(() => {
    form.reset({
      email: user?.email || '',
      fullName: user?.fullName || user?.employee?.fullName || '',
      role: user?.role || 'STAFF',
      isActive: user ? String(user.isActive !== false) : 'true',
    });
  }, [user]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setGlobalError(null);
    try {
      if (user) {
        await updateUser.mutateAsync({
          id: user.id,
          role: isSelf ? undefined : data.role,
          isActive: isSelf ? undefined : data.isActive === 'true',
        });
      } else {
        await createUser.mutateAsync({ ...data, isActive: true });
      }
      onClose();
    } catch (err) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
      {globalError && <div role="alert" style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{globalError}</div>}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {!user && <Input id="email" label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />}
        {!user && <Input id="fullName" label="Full Name" error={form.formState.errors.fullName?.message} {...form.register('fullName')} />}
        {!user && <Input id="password" label="Password" type="password" error={form.formState.errors.password?.message} {...form.register('password')} />}
        <Select id="role" label="Role" disabled={isSelf} options={[{ value: 'ADMIN', label: 'Admin' }, { value: 'MANAGER', label: 'Manager' }, { value: 'STAFF', label: 'Staff' }]} error={form.formState.errors.role?.message} {...form.register('role')} />
        {user && <Select id="isActive" label="Status" disabled={isSelf} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} error={form.formState.errors.isActive?.message} {...form.register('isActive')} />}
        <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>
          {user ? 'Save Changes' : 'Create User'}
        </Button>
      </form>
    </Modal>
  );
}

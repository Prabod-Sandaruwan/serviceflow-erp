import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { Input, Button } from '../../components/ui/Forms';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(12, 'Minimum 12 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const form = useZodForm(schema);

  const onSubmit = async ({ currentPassword, newPassword }: FormValues) => {
    setGlobalError(null);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast('Password updated successfully', 'success');
      navigate('/');
    } catch (err: unknown) {
      setGlobalError(applyApiErrors(form, err));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '14px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Change Password
        </h1>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
          Please update your password to continue.
        </p>
        {globalError && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {globalError}
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Input id="currentPassword" label="Current Password" type="password" autoComplete="off" error={form.formState.errors.currentPassword?.message} {...form.register('currentPassword')} />
          <Input id="newPassword" label="New Password" type="password" autoComplete="off" error={form.formState.errors.newPassword?.message} {...form.register('newPassword')} />
          <Input id="confirmPassword" label="Confirm Password" type="password" autoComplete="off" error={form.formState.errors.confirmPassword?.message} {...form.register('confirmPassword')} />
          <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', marginTop: '0.85rem', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>
            {form.formState.isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}

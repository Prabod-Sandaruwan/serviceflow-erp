import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from './AuthProvider';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { Input, Button } from '../../components/ui/Forms';
import { ApiError } from '../../lib/ApiError';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const form = useZodForm(loginSchema);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const res = (await login(data)) as any;
      const user = res?.data ?? res;
      if (user?.mustChangePassword) {
        navigate('/profile/password', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setGlobalError('Email or password is incorrect.');
        } else if (err.status === 429) {
          setGlobalError('Too many attempts. Please try again later.');
        } else {
          setGlobalError(applyApiErrors(form, err));
        }
      } else {
        setGlobalError((err as Error)?.message || 'An unexpected error occurred.');
      }
    }
  };

  const emailReg = form.register('email');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>
          ServiceFlow ERP
        </h1>
        {globalError && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {globalError}
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Input id="email" label="Email" type="email" error={form.formState.errors.email?.message} {...emailReg} ref={(el) => { emailReg.ref(el); emailRef.current = el; }} />
          <Input id="password" label="Password" type="password" autoComplete="off" error={form.formState.errors.password?.message} {...form.register('password')} />
          <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', marginTop: '0.5rem' }}>
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}

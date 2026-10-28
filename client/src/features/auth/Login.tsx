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

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
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
        if (err.status === 401) setGlobalError('Email or password is incorrect.');
        else if (err.status === 429) setGlobalError('Too many attempts. Please try again later.');
        else setGlobalError(applyApiErrors(form, err));
      } else {
        setGlobalError((err as Error)?.message || 'An unexpected error occurred.');
      }
    }
  };

  const emailReg = form.register('email');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', padding: '1rem' }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); }
      `}</style>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', animation: 'slideUp 0.6s forwards' }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>ServiceFlow ERP</h1>
        {globalError && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {globalError}
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Input id="email" label="Email" type="email" error={form.formState.errors.email?.message} {...emailReg} ref={(el) => { emailReg.ref(el); emailRef.current = el; }} />
          <Input id="password" label="Password" type="password" autoComplete="off" error={form.formState.errors.password?.message} {...form.register('password')} />
          <Button type="submit" disabled={form.formState.isSubmitting} className="login-btn" style={{ width: '100%', marginTop: '0.75rem', background: '#0f172a', transition: 'transform 0.2s ease, opacity 0.2s' }}>
            {form.formState.isSubmitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}

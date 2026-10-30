import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Layers, ShieldCheck } from 'lucide-react';
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
        const from = (location.state as any)?.from?.pathname;
        const target = !from || from === '/logout' ? '/' : from;
        navigate(target, { replace: true });
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #090d16 60%, #030712 100%)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .login-card label { color: #94a3b8 !important; font-weight: 500; font-size: 0.8125rem; }
        .login-card input { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid rgba(148, 163, 184, 0.2) !important; color: #f8fafc !important; border-radius: 8px !important; transition: all 0.2s ease !important; padding: 0.65rem 0.85rem !important; }
        .login-card input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important; }
        .login-btn { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%) !important; border-radius: 8px !important; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35) !important; transition: all 0.2s ease !important; font-weight: 600 !important; }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5) !important; }
      `}</style>
      <div className="login-card" style={{ width: '100%', maxWidth: '420px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '2.5rem 2rem', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(99, 102, 241, 0.1)', animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.65rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '0.75rem' }}>
            <Layers style={{ width: '1.75rem', height: '1.75rem', color: '#818cf8' }} />
          </div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>ServiceFlow ERP</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Enterprise Service & CRM Suite</p>
        </div>
        {globalError && (
          <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {globalError}
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Input id="email" label="Email" type="email" error={form.formState.errors.email?.message} {...emailReg} ref={(el) => { emailReg.ref(el); emailRef.current = el; }} />
          <Input id="password" label="Password" type="password" autoComplete="off" error={form.formState.errors.password?.message} {...form.register('password')} />
          <Button type="submit" disabled={form.formState.isSubmitting} className="login-btn" style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}>
            {form.formState.isSubmitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.75rem', color: '#475569', fontSize: '0.75rem' }}>
          <ShieldCheck style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} />
          <span>256-bit SSL Encrypted • Role Protected</span>
        </div>
      </div>
    </div>
  );
}

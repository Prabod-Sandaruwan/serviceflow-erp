import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useZodForm, applyApiErrors } from '../../lib/forms';
import { ApiError } from '../../lib/ApiError';
import { LoginShowcase } from './LoginShowcase';
import { LoginForm } from './LoginForm';
import { AuthInfoModal, type AuthInfoModalType } from './AuthInfoModal';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [modal, setModal] = useState<AuthInfoModalType>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const form = useZodForm(loginSchema);

  useEffect(() => { emailRef.current?.focus(); }, []);
  useEffect(() => {
    const h = location.hash.replace('#', '');
    if (['help', 'security', 'privacy', 'terms'].includes(h)) setModal(h as AuthInfoModalType);
  }, [location.hash]);

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

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f9ff]">
      <LoginShowcase />
      <section className="lg:w-5/12 xl:w-2/5 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen shadow-sm">
        <div className="flex justify-end items-center gap-3 sm:gap-4 text-xs font-medium text-slate-500 animate-fade-in">
          <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>System Status</span>
          </div>
          <span className="text-slate-300 select-none">|</span>
          <button type="button" onClick={() => setModal('help')} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" /><span>Help & Support</span>
          </button>
          <span className="text-slate-300 select-none">|</span>
          <button type="button" onClick={() => setModal('security')} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span>Security & Trust</span>
          </button>
        </div>

        <LoginForm
          form={form}
          emailRef={emailRef}
          globalError={globalError}
          onSubmit={form.handleSubmit(onSubmit)}
        />

        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-slate-500 text-xs">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setModal('privacy')} className="hover:text-slate-900 transition-colors">Privacy Policy</button>
            <button type="button" onClick={() => setModal('terms')} className="hover:text-slate-900 transition-colors">Terms of Service</button>
          </div>
          <p className="font-mono text-xs">© 2026 ServiceFlow Project</p>
        </div>
        <AuthInfoModal type={modal} onClose={() => setModal(null)} />
      </section>
    </main>
  );
}

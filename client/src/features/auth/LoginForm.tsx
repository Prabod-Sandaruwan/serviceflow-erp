import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export interface LoginFormProps {
  form: UseFormReturn<{ email: string; password: string }>;
  emailRef: React.RefObject<HTMLInputElement | null>;
  globalError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({ form, emailRef, globalError, onSubmit }: LoginFormProps) {
  const [showPwd, setShowPwd] = useState(false);
  const emailReg = form.register('email');
  const pwdReg = form.register('password');
  const { isSubmitting, errors } = form.formState;

  return (
    <div className="w-full max-w-md mx-auto my-auto py-8">
      <div className="mb-8">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-xl font-bold text-slate-900">ServiceFlow ERP</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
        <p className="mt-1.5 text-sm text-slate-500">Enter your credentials to access the application workspace.</p>
      </div>

      {globalError && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{globalError}</div>}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
            <input
              id="email" aria-label="Email" type="email" placeholder="name@example.com"
              {...emailReg} ref={(el) => { emailReg.ref(el); if (emailRef) (emailRef as any).current = el; }}
              className="block w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
            <input
              id="password" aria-label="Password" type={showPwd ? 'text' : 'password'} placeholder="Enter account password" autoComplete="off"
              {...pwdReg}
              className="block w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
            />
            <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPwd((p) => !p)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div className="pt-2">
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-60">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></> : <><span className="font-semibold">Sign In to ServiceFlow</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

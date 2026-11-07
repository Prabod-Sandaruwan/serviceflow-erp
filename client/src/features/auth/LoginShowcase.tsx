import { SlidersHorizontal, Zap } from 'lucide-react';

export function LoginShowcase() {
  return (
    <section className="hidden lg:flex lg:w-7/12 xl:w-3/5 bg-[#0b1c30] text-white relative overflow-hidden flex-col justify-between p-8 sm:p-12 lg:p-16 bg-tech-grid border-r border-slate-800/80 min-h-screen">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm border border-indigo-400/20">
            <span className="text-xl font-bold">S</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">ServiceFlow</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">ERP</span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Suite</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 my-auto py-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-6 backdrop-blur-sm text-xs font-semibold tracking-wide">
          <span>✦</span>
          <span>Next-Gen ERP & Workflow Suite</span>
        </div>
        <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Next-Gen ERP engineered for seamless workflow automation
        </h1>
        <p className="text-sm xl:text-base text-slate-300 mb-8 leading-relaxed">
          Fast, modular, and built for modern service businesses. An intuitive, self-hosted operational dashboard built to streamline project coordination, financial logging, and service management.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Modular & Scalable</span>
              <SlidersHorizontal className="text-indigo-400 w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white">Easily Adaptable</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tailored for evolving business workflows with effortless modularity and flexible setup.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Lightweight Stack</span>
              <Zap className="text-indigo-400 w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white">Fast & Responsive</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Optimized for low-latency interactions across all departments.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-xs font-medium text-slate-400">
        Enterprise-grade Security & Isolation
      </div>
    </section>
  );
}

export default LoginShowcase;

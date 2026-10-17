import React from 'react';
import { Layers, Activity, CheckCircle2, ShieldCheck, Database, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                ServiceFlow ERP
              </span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-3xl w-full">
          <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-8 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-inner">
                <Activity className="h-10 w-10 animate-pulse" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                ServiceFlow ERP Frontend Running
              </h1>

              <p className="text-slate-400 max-w-xl text-base sm:text-lg mb-8 leading-relaxed">
                Enterprise service management & ERP suite initialized with high-performance modern web technologies.
              </p>

              {/* Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left">
                  <Cpu className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">Architecture</div>
                    <div className="text-sm font-semibold text-slate-200">React 19 + Vite</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">TypeScript & CSS</div>
                    <div className="text-sm font-semibold text-slate-200">Tailwind CSS v3</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left">
                  <Database className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">Backend API</div>
                    <div className="text-sm font-semibold text-slate-200">Node 22 + Express</div>
                  </div>
                </div>
              </div>

              {/* Foundation Verification */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Phase 1 Foundation setup successfully verified.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
        ServiceFlow ERP &copy; {new Date().getFullYear()} — Enterprise Resource Planning
      </footer>
    </div>
  );
};

export default App;

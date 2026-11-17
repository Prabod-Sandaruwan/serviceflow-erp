export function MarginMetricCards({
  rev,
  exp,
  net,
}: {
  rev: number;
  exp: number;
  net: number;
}) {
  const fmt = (v: number) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="mt-6 grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Total Revenue
        </span>
        <p className="mt-1 text-sm font-black text-slate-900">${fmt(rev)}</p>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3 text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
          Op-Ex Burn
        </span>
        <p className="mt-1 text-sm font-black text-amber-600">${fmt(exp)}</p>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
          Net Earning
        </span>
        <p className="mt-1 text-sm font-black text-emerald-600">${fmt(net)}</p>
      </div>
    </div>
  );
}

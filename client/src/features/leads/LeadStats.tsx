import { PieChart, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useLeadStats } from './leadStatsHook';
import type { Lead } from './types';

const fmt = (v?: number) => (v != null ? `$${Math.round(v).toLocaleString()}` : '$0');

export function LeadStats({ leads }: { leads?: Lead[] }) {
  const { data: statsRes } = useLeadStats();
  const db = statsRes?.data;
  const list = leads || [];

  let tVal = db?.totalValue, cVal = db?.convertedValue, aVal = db?.activeValue, lVal = db?.lostValue;
  let tCnt = db?.totalCount, cCnt = db?.convertedCount, aCnt = db?.activeCount, lCnt = db?.lostCount;

  if (tVal === undefined) {
    tVal = 0; cVal = 0; aVal = 0; lVal = 0;
    cCnt = 0; aCnt = 0; lCnt = 0; tCnt = list.length;
    for (const l of list) {
      const v = l.expectedValue || 0;
      tVal += v;
      if (l.status === 'CONVERTED' || l.status === 'WON') { cVal += v; cCnt++; }
      else if (l.status === 'LOST') { lVal += v; lCnt++; }
      else { aVal += v; aCnt++; }
    }
  }

  const cards = [
    {
      title: 'Total Pipeline Value', val: fmt(tVal), color: 'text-slate-900',
      sub: <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><TrendingUp className="w-3 h-3" />{tCnt} recorded leads</span>,
      icon: <PieChart className="w-5 h-5 text-blue-600" />, iconBg: 'bg-blue-50',
    },
    {
      title: 'Converted Value', val: fmt(cVal), color: 'text-emerald-600',
      sub: <span className="text-[11px] font-medium text-slate-500">{cCnt} deals closed</span>,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, iconBg: 'bg-emerald-50',
    },
    {
      title: 'Active / In-Progress', val: fmt(aVal), color: 'text-blue-600',
      sub: <span className="text-[11px] font-medium text-slate-500">{aCnt} open deals</span>,
      icon: <Clock className="w-5 h-5 text-indigo-600" />, iconBg: 'bg-indigo-50',
    },
    {
      title: 'Lost Opportunities', val: fmt(lVal), color: 'text-rose-600',
      sub: <span className="text-[11px] font-medium text-rose-500">{lCnt} disqualified lead{lCnt === 1 ? '' : 's'}</span>,
      icon: <XCircle className="w-5 h-5 text-rose-600" />, iconBg: 'bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.title} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">{c.title}</span>
            <span className={`text-2xl font-black tracking-tight ${c.color} block`}>{c.val}</span>
            <div className="mt-1">{c.sub}</div>
          </div>
          <div className={`p-3 rounded-2xl ${c.iconBg}`}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
}

export default LeadStats;

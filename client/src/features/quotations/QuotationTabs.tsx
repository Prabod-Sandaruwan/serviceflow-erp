interface QuotationTabsProps {
  activeTab: string;
  onTabChange: (t: string) => void;
  isStaff: boolean;
}

export function QuotationTabs({ activeTab, onTabChange, isStaff }: QuotationTabsProps) {
  const tabs = [
    { id: 'all', label: 'All' },
    ...(!isStaff ? [{ id: 'pending', label: 'Pending approval' }] : []),
    { id: 'mine', label: 'Mine' },
  ];

  return (
    <div className="flex gap-2 border-b border-slate-200/80 mb-5 pb-0">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(t.id)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default QuotationTabs;


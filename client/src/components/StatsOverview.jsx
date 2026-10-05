import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatsOverview = ({ stats }) => {
  const { total = 0, pending = 0, inProgress = 0, completed = 0, overdue = 0 } = stats || {};
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = [
    {
      title: 'Total Projects',
      value: total,
      isPrimary: true, // Forest Green Card exactly like the mockup!
      badge: `${pending} pending in queue`,
    },
    {
      title: 'Ended Projects',
      value: completed,
      isPrimary: false,
      badge: `${completionPercentage}% completed`,
    },
    {
      title: 'Running Projects',
      value: inProgress,
      isPrimary: false,
      badge: 'Active in progress',
    },
    {
      title: 'Pending / Overdue',
      value: overdue > 0 ? overdue : pending,
      isPrimary: false,
      badge: overdue > 0 ? 'Requires attention' : 'On discuss',
      isAlert: overdue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        return (
          <div
            key={idx}
            className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 ${
              card.isPrimary
                ? 'bg-[#194D33] text-white shadow-xl shadow-[#194D33]/15'
                : 'bg-white border border-[#E5EAE6] text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
            }`}
          >
            {/* Header: Title and Circle Arrow */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-sm font-semibold tracking-tight ${
                  card.isPrimary ? 'text-white/90' : 'text-slate-600'
                }`}
              >
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  card.isPrimary
                    ? 'bg-white/15 text-white'
                    : 'border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="mb-4">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  card.isPrimary ? 'text-white' : 'text-slate-900'
                }`}
              >
                {card.value}
              </span>
            </div>

            {/* Sub-badge pill */}
            <div className="flex items-center">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  card.isPrimary
                    ? 'bg-white/15 text-emerald-100 border border-white/10'
                    : card.isAlert
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-[#EAF4EE] text-[#194D33] border border-[#D2E7DC]'
                }`}
              >
                <span className="text-[10px]">↑</span>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;

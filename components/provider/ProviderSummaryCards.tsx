import React from 'react';
import { Package, CheckCircle2, Trash2, Clock, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ProviderSummaryCards: React.FC = () => {
  const { lots, matches, selectedProviderId } = useAppStore();

  const providerLots = lots.filter((l) => l.providerId === selectedProviderId);
  const providerMatches = matches.filter((m) => {
    const lot = lots.find((l) => l.id === m.lotId);
    return lot && lot.providerId === selectedProviderId;
  });

  const totalListed = providerLots.reduce((sum, l) => sum + l.quantityTotal, 0);

  const totalDelivered = providerMatches
    .filter((m) => m.status === 'Delivered')
    .reduce((sum, m) => sum + m.quantityAllocated, 0);

  const totalWasted = providerLots.reduce((sum, l) => sum + (l.quantityWasted || 0), 0);

  const totalExpired = providerLots
    .filter((l) => l.status === 'Expired')
    .reduce((sum, l) => sum + l.quantityTotal, 0);

  const avgTimeToMatch = '14 mins';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Total Listed */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-[11px] font-semibold">Total Listed</span>
          <Package className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-xl font-bold text-stone-900 tracking-tight">{totalListed}</span>
          <span className="text-[10px] text-stone-400 font-medium ml-1">portions</span>
        </div>
      </div>

      {/* 2. Delivered */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-[11px] font-semibold">Delivered</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <span className="text-xl font-bold text-emerald-700 tracking-tight">{totalDelivered}</span>
          <span className="text-[10px] text-stone-400 font-medium ml-1">portions</span>
        </div>
      </div>

      {/* 3. Wasted */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-[11px] font-semibold">Logged Waste</span>
          <Trash2 className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <span className="text-xl font-bold text-amber-700 tracking-tight">{totalWasted}</span>
          <span className="text-[10px] text-stone-400 font-medium ml-1">portions</span>
        </div>
      </div>

      {/* 4. Expired */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-[11px] font-semibold">Expired</span>
          <Clock className="w-4 h-4 text-rose-600" />
        </div>
        <div>
          <span className="text-xl font-bold text-rose-700 tracking-tight">{totalExpired}</span>
          <span className="text-[10px] text-stone-400 font-medium ml-1">portions</span>
        </div>
      </div>

      {/* 5. Avg Match Time */}
      <div className="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-[11px] font-semibold">Avg Match Speed</span>
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-xl font-bold text-stone-900 tracking-tight">{avgTimeToMatch}</span>
          <span className="text-[10px] text-emerald-600 font-medium ml-1">automated</span>
        </div>
      </div>
    </div>
  );
};

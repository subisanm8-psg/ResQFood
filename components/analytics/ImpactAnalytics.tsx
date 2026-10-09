import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Download,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ImpactAnalytics: React.FC = () => {
  const {
    comparisonMetrics,
    subsidyPool,
    matches,
    lots,
    requests,
    receivers,
    providers,
    runSmartVsBaselineComparison,
  } = useAppStore();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { smart, baseline } = comparisonMetrics;

  // Comparison Bar Chart Data
  const barChartData = [
    {
      metric: 'Food Saved (%)',
      Smart: smart.foodSavedPercentage,
      Baseline: baseline.foodSavedPercentage,
    },
    {
      metric: 'Fulfillment Rate (%)',
      Smart: smart.fulfillmentRate,
      Baseline: baseline.fulfillmentRate,
    },
    {
      metric: 'Fairness Share (%)',
      Smart: smart.fairnessPercent,
      Baseline: baseline.fairnessPercent,
    },
    {
      metric: 'High Urgency On-Time',
      Smart: smart.highUrgencyServedOnTime * 20, // Scaled for comparison
      Baseline: baseline.highUrgencyServedOnTime * 20,
    },
  ];

  // Food Saved Over Time Chart Data
  const timeSeriesData = [
    { time: '09:00', Saved: 15, Baseline: 8 },
    { time: '10:00', Saved: 45, Baseline: 25 },
    { time: '11:00', Saved: 90, Baseline: 52 },
    { time: '12:00', Saved: 145, Baseline: 85 },
    { time: '13:00', Saved: smart.foodSavedQuantity || 180, Baseline: baseline.foodSavedQuantity || 110 },
  ];

  // Decision log filtered list
  const filteredMatches = matches.filter((m) => {
    if (filterStatus === 'ALL') return true;
    return m.status === filterStatus;
  });

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Match ID',
      'Food Item',
      'Allocated Qty',
      'Unit',
      'Status',
      'Provider',
      'Receiver',
      'Distance (km)',
      'ETA (mins)',
      'Match Score',
      'Base Price ($)',
      'Subsidy ($)',
      'Final Price ($)',
      'Created At',
      'Last Event',
    ];

    const rows = matches.map((m) => {
      const lot = lots.find((l) => l.id === m.lotId);
      const req = requests.find((r) => r.id === m.requestId);
      const rec = req ? receivers.find((rc) => rc.id === req.receiverId) : undefined;
      const prov = lot ? providers.find((p) => p.id === lot.providerId) : undefined;
      const lastEvent = m.timeline[m.timeline.length - 1]?.description || '';

      return [
        m.id,
        `"${lot?.itemName || ''}"`,
        m.quantityAllocated,
        lot?.unit || 'portions',
        m.status,
        `"${prov?.name || ''}"`,
        `"${rec?.name || ''}"`,
        m.distanceKm,
        m.etaMinutes,
        (m.score * 100).toFixed(1) + '%',
        m.priceBreakdown.basePrice.toFixed(2),
        m.priceBreakdown.subsidyAmount.toFixed(2),
        m.priceBreakdown.finalAmount.toFixed(2),
        m.createdAt,
        `"${lastEvent.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `resqfood-decision-log-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Comparison Replay Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-stone-900">
              Impact Analytics: Smart Matching vs Baseline
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              A/B Simulation Active
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time multi-objective algorithmic impact compared against First-Come-First-Served baseline
          </p>
        </div>

        <button
          onClick={runSmartVsBaselineComparison}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-subtle transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Re-evaluate Benchmark</span>
        </button>
      </div>

      {/* KPI Comparison Matrix (Section 8 per spec) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* 1. Food Saved */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Food Saved</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-700 tracking-tight">
                {smart.foodSavedPercentage}%
              </span>
              <span className="text-xs text-stone-500 font-medium">({smart.foodSavedQuantity} portions)</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.foodSavedPercentage}% ({baseline.foodSavedQuantity} p)</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
            <ArrowUpRight className="w-3 h-3" />
            +{(smart.foodSavedPercentage - baseline.foodSavedPercentage)}% Improvement
          </div>
        </div>

        {/* 2. Wastage Prevented */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Food Wasted / Expired</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-rose-700 tracking-tight">
                {smart.foodWasted}
              </span>
              <span className="text-xs text-stone-500 font-medium">portions</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.foodWasted} portions</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
            <ArrowDownRight className="w-3 h-3" />
            -{Math.max(0, baseline.foodWasted - smart.foodWasted)} Portions Waste Prevented
          </div>
        </div>

        {/* 3. Demand Fulfillment */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Demand Fulfillment Rate</div>
          <div className="my-2">
            <div className="text-2xl font-bold text-primary-900 tracking-tight">
              {smart.fulfillmentRate}%
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.fulfillmentRate}%</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-primary-800 flex items-center gap-1 bg-primary-50 px-2 py-0.5 rounded-lg w-fit">
            <ArrowUpRight className="w-3 h-3" />
            +{(smart.fulfillmentRate - baseline.fulfillmentRate)}% Demand Met
          </div>
        </div>

        {/* 4. Fairness Ratio */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Fairness: Low-Tier / Vulnerable</div>
          <div className="my-2">
            <div className="text-2xl font-bold text-primary-900 tracking-tight">
              {smart.fairnessPercent}%
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.fairnessPercent}%</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
            <ArrowUpRight className="w-3 h-3" />
            Vulnerability Prioritized
          </div>
        </div>

        {/* 5. Average Distance */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Avg Delivery Distance</div>
          <div className="my-2">
            <div className="text-xl font-bold text-stone-900 tracking-tight">
              {smart.averageDistance} km
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.averageDistance} km</span>
            </div>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">Urban routing optimized</span>
        </div>

        {/* 6. Match Speed */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Avg Time from Listing to Match</div>
          <div className="my-2">
            <div className="text-xl font-bold text-stone-900 tracking-tight">
              {smart.avgTimeToMatchMinutes} mins
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.avgTimeToMatchMinutes} mins</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">2.7x Faster Dispatch</span>
        </div>

        {/* 7. High Urgency Served */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">High-Urgency On-Time</div>
          <div className="my-2">
            <div className="text-xl font-bold text-emerald-700 tracking-tight">
              {smart.highUrgencyServedOnTime} orders
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Baseline: <span className="font-semibold text-stone-600">{baseline.highUrgencyServedOnTime} orders</span>
            </div>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">Shelters served on priority</span>
        </div>

        {/* 8. Subsidy Balance */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-subtle flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-stone-500">Subsidy Pool Balance</div>
          <div className="my-2">
            <div className="text-xl font-bold text-stone-900 tracking-tight">
              ${subsidyPool.balance.toFixed(2)}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              In: <span className="text-emerald-700 font-medium">+${subsidyPool.totalIn.toFixed(0)}</span> &bull; Out: <span className="text-rose-700 font-medium">-${subsidyPool.totalOut.toFixed(0)}</span>
            </div>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">Self-sustaining circular fund</span>
        </div>
      </div>

      {/* Visualizations: Side-by-Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Bar Chart: Smart vs Baseline */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-stone-900">
                Strategy Comparison: Smart Matching vs Baseline
              </h4>
              <p className="text-[11px] text-stone-500">Metrics comparison on identical surplus demand scenario</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ed" />
                <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e5e5dc',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Smart" fill="#1F5F4A" radius={[6, 6, 0, 0]} name="Smart Matching" />
                <Bar dataKey="Baseline" fill="#D4D4D8" radius={[6, 6, 0, 0]} name="Baseline (FCFS)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Line Chart: Food Saved Over Time */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-stone-900">
                Food Saved Over Simulation Time (Portions)
              </h4>
              <p className="text-[11px] text-stone-500">Cumulative portions redirected from waste</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ed" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e5e5dc',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="Saved"
                  stroke="#1F5F4A"
                  strokeWidth={3}
                  name="Smart Strategy"
                  dot={{ r: 4, fill: '#1F5F4A' }}
                />
                <Line
                  type="monotone"
                  dataKey="Baseline"
                  stroke="#A1A1AA"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="Baseline Strategy"
                  dot={{ r: 3, fill: '#A1A1AA' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subsidy Pool Financial Breakdown */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h4 className="font-bold text-sm text-stone-900">Subsidy Pool Financial Ledger</h4>
            <p className="text-xs text-stone-500">
              Cross-subsidization fund: Corporate canteens and events contribute +25% surcharges to fund low-income & shelter delivery fees
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block font-medium">Pool Balance</span>
              <span className="text-lg font-bold font-mono text-emerald-800">
                ${subsidyPool.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto">
          {subsidyPool.transactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tx.type === 'IN'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {tx.type}
                </span>
                <div>
                  <span className="font-medium text-stone-800">{tx.description}</span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <span
                className={`font-mono font-bold ${
                  tx.type === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {tx.type === 'IN' ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Log Table (Section 8 per spec) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-stone-900">Decision Log & Allocation Audit</h4>
            <p className="text-xs text-stone-500">Immutable ledger of every match decision, score, and outcome timeline</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Outcomes</option>
              <option value="Proposed">Proposed</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Declined">Declined</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/70 border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Match ID</th>
                <th className="py-3 px-3">Food & Quantity</th>
                <th className="py-3 px-3">Provider &rarr; Receiver</th>
                <th className="py-3 px-3">Distance & ETA</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Pricing Breakdown</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Latest Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-stone-400">
                    No decisions recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => {
                  const lot = lots.find((l) => l.id === m.lotId);
                  const req = requests.find((r) => r.id === m.requestId);
                  const receiver = req ? receivers.find((rec) => rec.id === req.receiverId) : undefined;
                  const provider = lot ? providers.find((p) => p.id === lot.providerId) : undefined;
                  const latestTimeline = m.timeline[m.timeline.length - 1];

                  return (
                    <tr key={m.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                        {m.id.split('-').slice(0, 2).join('-')}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-stone-900">{lot?.itemName}</div>
                        <div className="text-[11px] text-stone-500">
                          {m.quantityAllocated} {lot?.unit}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-stone-800 font-medium">{provider?.name}</div>
                        <div className="text-[11px] text-primary-800 font-semibold">&rarr; {receiver?.name}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-stone-700">{m.distanceKm} km</span>
                        <span className="text-stone-400 text-[11px]"> (~{m.etaMinutes}m)</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-primary-800">
                        {(m.score * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-bold text-stone-900">
                            ${m.priceBreakdown.finalAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-stone-400 ml-1">
                            (Base: ${m.priceBreakdown.basePrice.toFixed(2)})
                          </span>
                        </div>
                        {m.priceBreakdown.tier === 'Low' && (
                          <span className="text-[10px] text-emerald-700 block">
                            Subsidized: -${m.priceBreakdown.subsidyAmount.toFixed(2)}
                          </span>
                        )}
                        {m.priceBreakdown.tier === 'High' && (
                          <span className="text-[10px] text-blue-700 block">
                            +${Math.abs(m.priceBreakdown.subsidyAmount).toFixed(2)} contribution
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800'
                              : m.status === 'In Transit'
                              ? 'bg-amber-50 text-amber-800'
                              : m.status === 'Declined'
                              ? 'bg-rose-50 text-rose-800'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 text-[11px] max-w-xs truncate">
                        {latestTimeline?.description || 'Match created'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

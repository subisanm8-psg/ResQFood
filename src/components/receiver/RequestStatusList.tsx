import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Truck, Package, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FoodRequest } from '../../types';
import { CountdownChip } from '../common/CountdownChip';
import { EmptyState } from '../common/EmptyState';

export const RequestStatusList: React.FC<{ onNewRequest: () => void }> = ({ onNewRequest }) => {
  const { requests, matches, selectedReceiverId, simulatedClock } = useAppStore();

  const receiverRequests = requests.filter((r) => r.receiverId === selectedReceiverId);

  const getStatusBadge = (request: FoodRequest) => {
    switch (request.status) {
      case 'Waiting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Waiting for Match
          </span>
        );
      case 'Matched':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Matched (Reviewing)
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Accepted
          </span>
        );
      case 'In Transit':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            In Transit
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Delivered
          </span>
        );
      case 'Partially Fulfilled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Partially Fulfilled
          </span>
        );
      case 'Unfulfilled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            Unfulfilled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-stone-900">Food Requests & Status</h3>
          <p className="text-xs text-stone-500">Track demand status from creation through live fulfillment</p>
        </div>
        <button
          onClick={onNewRequest}
          className="text-xs font-semibold text-primary hover:text-primary-800 transition-colors"
        >
          + New Request
        </button>
      </div>

      {receiverRequests.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Package}
            title="No active food requests"
            description="Create a request with dietary preferences and quantity needed to receive matched surplus lots."
            actionText="Publish Food Request"
            onAction={onNewRequest}
          />
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {receiverRequests.map((req) => (
            <div key={req.id} className="p-4 hover:bg-stone-50/60 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      req.foodPreference === 'Veg'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {req.foodPreference}
                  </span>
                  <span className="font-bold text-xs text-stone-900">
                    {req.quantityNeeded} portions needed
                  </span>
                  <span className="text-stone-400 text-xs">
                    ({req.quantityReceived || 0} received)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.urgency === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : req.urgency === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {req.urgency} Urgency
                  </span>
                  {getStatusBadge(req)}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-1">
                <div className="flex items-center gap-2">
                  <span>Categories:</span>
                  <span className="font-medium text-stone-700">
                    {req.broadPreferences.join(', ')}
                  </span>
                </div>

                <CountdownChip
                  targetIso={req.neededBy}
                  currentIso={simulatedClock}
                  prefix="Needed in"
                />
              </div>

              {/* Delivery Progress Bar & Status Chip (Fix 4) */}
              {(() => {
                const activeMatch = matches.find(
                  (m) => m.requestId === req.id && (m.status === 'In Transit' || m.delivery)
                );
                if (!activeMatch?.delivery) return null;
                const progressPct = Math.min(100, Math.round(activeMatch.delivery.progress * 100));

                return (
                  <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-700" />
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {activeMatch.delivery.status}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-amber-950">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Unfulfilled Reason if applicable */}
              {req.unfulfilledReason && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5 mt-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Redistribution Status: </strong>
                    {req.unfulfilledReason}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

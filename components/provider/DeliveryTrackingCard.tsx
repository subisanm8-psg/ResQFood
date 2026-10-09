import React from 'react';
import { Truck, CheckCircle2, Navigation, Clock, User, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const DeliveryTrackingCard: React.FC = () => {
  const { matches, lots, deliveryPartners, providers, receivers, selectedProviderId } = useAppStore();

  // Find active in-transit or recently accepted match for this provider
  const activeDelivery = matches.find((m) => {
    const lot = lots.find((l) => l.id === m.lotId);
    return lot && lot.providerId === selectedProviderId && (m.status === 'In Transit' || m.status === 'Accepted');
  });

  if (!activeDelivery) return null;

  const lot = lots.find((l) => l.id === activeDelivery.lotId);
  const partner = deliveryPartners.find((p) => p.id === activeDelivery.deliveryPartnerId);
  const receiver = receivers.find((r) => {
    const matchReq = useAppStore.getState().requests.find((rq) => rq.id === activeDelivery.requestId);
    return matchReq && matchReq.receiverId === r.id;
  });

  const progress = activeDelivery.currentRouteProgress || 15;

  const steps = [
    { label: 'Assigned', threshold: 10, completed: progress >= 10 },
    { label: 'Picked Up', threshold: 40, completed: progress >= 40 },
    { label: 'In Transit', threshold: 60, completed: progress >= 60 },
    { label: 'Delivered', threshold: 100, completed: progress >= 100 },
  ];

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Live Delivery in Transit</h4>
            <p className="text-[11px] text-stone-500">
              {activeDelivery.quantityAllocated} {lot?.unit} of "{lot?.itemName}"
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
          Live Tracking Active
        </span>
      </div>

      {/* Courier details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-stone-50/70 rounded-2xl border border-stone-100 text-xs">
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Logistics Partner</span>
          <span className="font-bold text-stone-900 truncate block">{partner?.companyName}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Vehicle / Plate</span>
          <span className="font-semibold text-stone-800 truncate block">
            {partner?.vehicleType} ({partner?.plateNumber})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Driver</span>
          <span className="font-semibold text-stone-800 truncate block flex items-center gap-1">
            <User className="w-3 h-3 text-stone-500" />
            {partner?.driverName}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Destination</span>
          <span className="font-bold text-primary-800 truncate block">{receiver?.name}</span>
        </div>
      </div>

      {/* Progress Bar & Status Steps */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-[11px] font-medium text-stone-600">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            Route Completion
          </span>
          <span className="font-bold font-mono text-primary-800">{Math.round(progress)}%</span>
        </div>

        <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-4 pt-1 text-center">
          {steps.map((st, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`w-2 h-2 rounded-full mb-1 ${
                  st.completed ? 'bg-primary' : 'bg-stone-300'
                }`}
              />
              <span
                className={`text-[10px] font-semibold ${
                  st.completed ? 'text-primary-900' : 'text-stone-400'
                }`}
              >
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

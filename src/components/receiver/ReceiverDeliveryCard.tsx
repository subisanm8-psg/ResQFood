import React, { useState } from 'react';
import { Truck, Navigation, CheckCircle2, User, Phone, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Match, FoodLot, Provider } from '../../types';

interface ReceiverDeliveryCardProps {
  match: Match;
  lot: FoodLot;
  provider: Provider;
}

export const ReceiverDeliveryCard: React.FC<ReceiverDeliveryCardProps> = ({
  match,
  lot,
  provider,
}) => {
  const { deliveryPartners, confirmDeliveryReceived, receivers, requests, selectedReceiverId } = useAppStore();

  const [deliveredQuantity, setDeliveredQuantity] = useState<number>(match.quantityAllocated);

  const partner = deliveryPartners.find((p) => p.id === match.deliveryPartnerId);
  const progressNormalized = match.delivery?.progress ?? (match.currentRouteProgress ? match.currentRouteProgress / 100 : 0);
  const progressPercent = Math.min(100, Math.round(progressNormalized * 100));
  const isDelivered = progressNormalized >= 1.0 || match.status === 'Delivered' || match.delivery?.status === 'Delivered';

  // Calculate ETA remaining countdown
  const remainingMinutes = isDelivered
    ? 0
    : Math.max(1, Math.round((match.delivery?.etaMinutes || match.etaMinutes || 25) * (1 - progressNormalized)));

  const steps = [
    { label: 'Assigned', completed: progressNormalized >= 0 },
    { label: 'Picked up', completed: progressNormalized >= 0.25 },
    { label: 'On the way', completed: progressNormalized >= 0.3 },
    { label: 'Delivered', completed: progressNormalized >= 1.0 },
  ];

  const receiver =
    receivers.find((r) => r.id === selectedReceiverId) ||
    receivers.find((r) => {
      const req = requests.find((rq) => rq.id === match.requestId);
      return req?.receiverId === r.id;
    });

  return (
    <div className="bg-white rounded-3xl border border-amber-300 shadow-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-stone-900">{match.delivery?.status || (isDelivered ? 'Delivered' : 'Delivery in Progress')}</h4>
              {!isDelivered && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
            </div>
            <p className="text-[11px] text-stone-500">
              {match.quantityAllocated} {lot.unit} of "{lot.itemName}"
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 font-semibold block uppercase">Estimated Arrival</span>
          <span className="text-sm font-mono font-bold text-amber-900">
            {isDelivered ? 'Arrived' : `~${remainingMinutes} mins`}
          </span>
        </div>
      </div>

      {/* Origin and Destination Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-amber-50/40 rounded-2xl border border-amber-100 text-xs">
        <div>
          <span className="text-[10px] text-amber-800/70 font-semibold block uppercase">Pickup (Provider)</span>
          <span className="font-bold text-stone-900 block truncate">{provider.name}</span>
          <span className="text-[11px] text-stone-500 block truncate">{provider.address}</span>
        </div>
        <div>
          <span className="text-[10px] text-amber-800/70 font-semibold block uppercase">Drop-off (Receiver)</span>
          <span className="font-bold text-stone-900 block truncate">{receiver?.name || 'Your Facility'}</span>
          <span className="text-[11px] text-stone-500 block truncate">{receiver?.address || 'Designated Receiving Center'}</span>
        </div>
      </div>

      {/* Courier Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-stone-50/70 rounded-2xl border border-stone-100 text-xs">
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Logistics Partner</span>
          <span className="font-bold text-stone-900 truncate block">{partner?.companyName}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Vehicle Details</span>
          <span className="font-semibold text-stone-800 truncate block">
            {partner?.vehicleType} ({partner?.plateNumber})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Assigned Driver</span>
          <span className="font-semibold text-stone-800 truncate block flex items-center gap-1">
            <User className="w-3 h-3 text-stone-500" />
            {partner?.driverName}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-medium">Driver Contact</span>
          <span className="font-semibold text-stone-800 truncate block flex items-center gap-1">
            <Phone className="w-3 h-3 text-stone-500" />
            {partner?.phone || '+91 98401 22334'}
          </span>
        </div>
      </div>

      {/* Route Step Indicator with animated moving van icon */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between text-[11px] font-medium text-stone-600">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            Live Route Progress
          </span>
          <span className="font-mono font-bold text-primary-800">{progressPercent}% Complete</span>
        </div>

        {/* Moving Van on Track */}
        <div className="relative pt-6 pb-2">
          {/* Animated Van Pin */}
          <div
            className="absolute top-0 -translate-x-1/2 transition-all duration-300 flex flex-col items-center z-10"
            style={{ left: `${Math.max(4, Math.min(96, progressPercent))}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-pulse">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="w-0.5 h-1.5 bg-amber-500" />
          </div>

          <div className="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 pt-1 text-center">
          {steps.map((st, i) => {
            const isCurrent =
              st.completed &&
              (i === steps.length - 1 || !steps[i + 1].completed);

            return (
              <div key={i} className="flex flex-col items-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full mb-1 transition-all ${
                    isCurrent
                      ? 'bg-amber-600 ring-4 ring-amber-200'
                      : st.completed
                      ? 'bg-amber-600'
                      : 'bg-stone-300'
                  }`}
                />
                <span
                  className={`text-[10px] ${
                    isCurrent
                      ? 'font-bold text-amber-950 underline decoration-amber-500 decoration-2'
                      : st.completed
                      ? 'font-semibold text-stone-800'
                      : 'text-stone-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Received Action */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-stone-600 font-medium">Confirm Quantity Received:</label>
          <input
            type="number"
            min="1"
            max={match.quantityAllocated}
            value={deliveredQuantity}
            onChange={(e) => setDeliveredQuantity(parseInt(e.target.value) || match.quantityAllocated)}
            disabled={!isDelivered}
            className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg font-bold text-stone-900 text-center disabled:opacity-50"
          />
          <span className="text-stone-500">{lot.unit}</span>
        </div>

        <button
          onClick={() => confirmDeliveryReceived(match.id, deliveredQuantity)}
          disabled={!isDelivered}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-card transition-all flex items-center justify-center gap-2 ${
            isDelivered
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-70'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isDelivered ? 'Confirm Food Received' : 'Waiting for Delivery...'}</span>
        </button>
      </div>
    </div>
  );
};

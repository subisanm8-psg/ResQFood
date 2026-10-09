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
  const { deliveryPartners, confirmDeliveryReceived } = useAppStore();

  const [deliveredQuantity, setDeliveredQuantity] = useState<number>(match.quantityAllocated);

  const partner = deliveryPartners.find((p) => p.id === match.deliveryPartnerId);
  const progress = match.currentRouteProgress || 20;

  // Calculate ETA remaining countdown
  const remainingMinutes = Math.max(
    1,
    Math.round(match.etaMinutes * (1 - progress / 100))
  );

  const steps = [
    { label: 'Assigned', completed: progress >= 10 },
    { label: 'Picked up', completed: progress >= 40 },
    { label: 'In transit', completed: progress >= 60 },
    { label: 'Delivered', completed: progress >= 100 },
  ];

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
              <h4 className="text-xs font-bold text-stone-900">Delivery in Progress</h4>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <p className="text-[11px] text-stone-500">
              {match.quantityAllocated} {lot.unit} of "{lot.itemName}" from {provider.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 font-semibold block uppercase">Estimated Arrival</span>
          <span className="text-sm font-mono font-bold text-amber-900">
            ~{remainingMinutes} mins
          </span>
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
            {partner?.phone || '+1 (415) 555-7101'}
          </span>
        </div>
      </div>

      {/* Route Step Indicator */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-[11px] font-medium text-stone-600">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            Live Route Progress
          </span>
          <span className="font-mono font-bold text-primary-800">{Math.round(progress)}% Complete</span>
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
            className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg font-bold text-stone-900 text-center"
          />
          <span className="text-stone-500">{lot.unit}</span>
        </div>

        <button
          onClick={() => confirmDeliveryReceived(match.id, deliveredQuantity)}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs shadow-card transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Confirm Food Received</span>
        </button>
      </div>
    </div>
  );
};

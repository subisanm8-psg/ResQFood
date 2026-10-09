import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FoodLot, WasteReason } from '../../types';

interface LogWasteModalProps {
  lot: FoodLot | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogWasteModal: React.FC<LogWasteModalProps> = ({ lot, isOpen, onClose }) => {
  const { logWaste } = useAppStore();

  const [quantity, setQuantity] = useState<number>(5);
  const [reason, setReason] = useState<WasteReason>('spoiled');

  if (!isOpen || !lot) return null;

  const maxWastable = lot.quantityRemaining;
  const projectedWastedTotal = lot.quantityWasted + quantity;
  const projectedWastePct = Math.min(
    100,
    Math.round((projectedWastedTotal / lot.quantityTotal) * 100)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > maxWastable) return;
    logWaste(lot.id, quantity, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Log Surplus Waste</h3>
              <p className="text-xs text-stone-500">{lot.itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Current Status Card */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="flex justify-between items-center text-stone-600">
              <span>Remaining Available:</span>
              <span className="font-bold text-stone-900">
                {lot.quantityRemaining} {lot.unit}
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span>Already Wasted:</span>
              <span className="font-bold text-rose-700">
                {lot.quantityWasted} {lot.unit} ({Math.round((lot.quantityWasted / lot.quantityTotal) * 100)}%)
              </span>
            </div>
          </div>

          {/* Waste Quantity */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Quantity to Mark as Wasted ({lot.unit})
            </label>
            <input
              type="number"
              min="1"
              max={maxWastable}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(maxWastable, Math.max(1, parseInt(e.target.value) || 0)))
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Primary Reason for Waste
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as WasteReason)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none"
            >
              <option value="spoiled">Spoiled / Temperature breach</option>
              <option value="expired">Passed safe consumption expiry window</option>
              <option value="over-prepared">Over-prepared / unserved kitchen prep</option>
            </select>
          </div>

          {/* Projected Waste Indicator */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              Projected Total Lot Waste: {projectedWastePct}%
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Recording this will remove {quantity} {lot.unit} from available redistributable inventory and log audit metrics for impact analytics.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-semibold shadow-card transition-all"
            >
              Confirm Log Waste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Plus, AlertCircle, Clock, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FoodPreference, FoodCategory, UrgencyLevel } from '../../types';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_CATEGORIES: FoodCategory[] = ['Cooked meal', 'Bakery', 'Produce', 'Packaged', 'Dairy'];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose }) => {
  const { selectedReceiverId, createFoodRequest, simulatedClock } = useAppStore();

  const [foodPreference, setFoodPreference] = useState<FoodPreference>('Veg');
  const [broadPreferences, setBroadPreferences] = useState<FoodCategory[]>(['Cooked meal']);
  const [quantityNeeded, setQuantityNeeded] = useState<number>(45);
  const [neededInHours, setNeededInHours] = useState<number>(3);
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');

  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const toggleCategory = (cat: FoodCategory) => {
    if (broadPreferences.includes(cat)) {
      if (broadPreferences.length > 1) {
        setBroadPreferences(broadPreferences.filter((c) => c !== cat));
      }
    } else {
      setBroadPreferences([...broadPreferences, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityNeeded <= 0) {
      setError('Quantity needed must be greater than 0.');
      return;
    }

    const current = new Date(simulatedClock);
    const deadline = new Date(current.getTime() + neededInHours * 3600 * 1000).toISOString();

    createFoodRequest({
      receiverId: selectedReceiverId,
      foodPreference,
      broadPreferences,
      quantityNeeded,
      neededBy: deadline,
      urgency,
    });

    onClose();
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-base font-bold text-stone-900">New Food Request</h3>
            <p className="text-xs text-stone-500">Request surplus food lots from local providers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Primary Dietary Toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Dietary Preference (Primary Constraint)
            </label>
            <div className="grid grid-cols-3 gap-2 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80">
              {(['Veg', 'Non-Veg', 'Any'] as FoodPreference[]).map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setFoodPreference(pref)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    foodPreference === pref
                      ? 'bg-white text-stone-900 shadow-card border border-stone-200/60'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {foodPreference === pref && <Check className="w-3.5 h-3.5 text-primary" />}
                  <span>{pref}</span>
                </button>
              ))}
            </div>
            {foodPreference === 'Veg' && (
              <p className="text-[11px] text-emerald-800 mt-1.5">
                Strict Veg constraint: The matcher will never assign Non-Veg or Mixed food items.
              </p>
            )}
          </div>

          {/* Broad Preferences (Chips) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Acceptable Food Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = broadPreferences.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary-100 text-primary-900 border border-primary-300 shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 border border-stone-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Needed */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Quantity Needed (Portions)
            </label>
            <input
              type="number"
              min="1"
              value={quantityNeeded}
              onChange={(e) => {
                setQuantityNeeded(Math.max(1, parseInt(e.target.value) || 0));
                setError('');
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          {/* Needed By Deadline */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-stone-700">Needed By Deadline</label>
              <span className="font-bold text-primary font-mono text-xs">
                Within +{neededInHours} hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={neededInHours}
              onChange={(e) => setNeededInHours(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>1 hr (Immediate)</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Urgency Level (Influences Request Priority Score)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as UrgencyLevel[]).map((lvl) => {
                const isSelected = urgency === lvl;
                let bgActive = 'bg-primary text-white';
                if (lvl === 'Critical') bgActive = 'bg-rose-600 text-white';
                else if (lvl === 'High') bgActive = 'bg-amber-600 text-white';

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 px-2 rounded-xl font-bold text-xs transition-all ${
                      isSelected
                        ? `${bgActive} shadow-card`
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
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
              className="px-5 py-2 bg-primary hover:bg-primary-800 text-white rounded-xl font-semibold shadow-card transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Publish Food Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

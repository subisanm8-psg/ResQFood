import React, { useState } from 'react';
import { Users, MapPin, DollarSign, Shield, Info, Edit3, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { OrgType, AffordabilityTier } from '../../types';

export const ReceiverProfileCard: React.FC = () => {
  const { receivers, selectedReceiverId, setSelectedReceiverId } = useAppStore();

  const receiver = receivers.find((r) => r.id === selectedReceiverId) || receivers[0];

  const [isEditing, setIsEditing] = useState(false);
  const [headcount, setHeadcount] = useState(receiver.headcount);
  const [tier, setTier] = useState<AffordabilityTier>(receiver.affordabilityTier);

  // Sync state when selected receiver changes
  React.useEffect(() => {
    setHeadcount(receiver.headcount);
    setTier(receiver.affordabilityTier);
    setIsEditing(false);
  }, [receiver.id, receiver.headcount, receiver.affordabilityTier]);

  const handleSave = () => {
    // Update store
    useAppStore.setState((state) => ({
      receivers: state.receivers.map((r) =>
        r.id === receiver.id
          ? {
              ...r,
              headcount,
              affordabilityTier: tier,
              vulnerabilityScore: tier === 'Low' ? 0.9 : tier === 'Medium' ? 0.5 : 0.15,
            }
          : r
      ),
    }));
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="receiver-select" className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Active Organization:
              </label>
              <select
                id="receiver-select"
                value={selectedReceiverId}
                onChange={(e) => setSelectedReceiverId(e.target.value)}
                className="font-bold text-sm text-stone-900 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 focus:outline-none"
              >
                {receivers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.organizationType} &bull; {r.affordabilityTier} Tier)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {receiver.location.address}
            </p>
          </div>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 hover:bg-stone-50 transition-colors self-start sm:self-center"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save Profile</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Edit Details</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Details & Tier Helper */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-stone-50/70 rounded-2xl border border-stone-100">
          <span className="text-[10px] text-stone-400 font-medium block">Organization Type</span>
          <span className="font-bold text-stone-900 mt-0.5 block">{receiver.organizationType}</span>
        </div>

        <div className="p-3 bg-stone-50/70 rounded-2xl border border-stone-100">
          <span className="text-[10px] text-stone-400 font-medium block">Community Headcount</span>
          {isEditing ? (
            <input
              type="number"
              min="5"
              value={headcount}
              onChange={(e) => setHeadcount(parseInt(e.target.value) || 10)}
              className="w-full mt-1 px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
            />
          ) : (
            <span className="font-bold text-stone-900 mt-0.5 block">{receiver.headcount} people</span>
          )}
        </div>

        <div className="p-3 bg-stone-50/70 rounded-2xl border border-stone-100">
          <span className="text-[10px] text-stone-400 font-medium block">Affordability Tier</span>
          {isEditing ? (
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as AffordabilityTier)}
              className="w-full mt-1 px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
            >
              <option value="Low">Low Tier (Nominal + Subsidy)</option>
              <option value="Medium">Medium Tier (Base Price)</option>
              <option value="High">High Tier (+25% Contribution)</option>
            </select>
          ) : (
            <span
              className={`font-bold mt-0.5 block ${
                receiver.affordabilityTier === 'Low'
                  ? 'text-emerald-700'
                  : receiver.affordabilityTier === 'High'
                  ? 'text-blue-700'
                  : 'text-stone-800'
              }`}
            >
              {receiver.affordabilityTier} Tier
            </span>
          )}
        </div>
      </div>

      {/* Affordability Tier Helper Box (Section 4 per spec) */}
      <div className="p-3 rounded-2xl bg-primary-50/60 border border-primary-200/70 text-[11px] text-primary-950 flex items-start gap-2">
        <Info className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Tiered Redistribution Equity: </strong>
          Low tier receivers (orphanages, shelters) pay a nominal fee (capped at $6.00) with shortfalls funded by the community Subsidy Pool. High tier receivers (corporate canteens, banquets) pay the standard fee plus a 25% subsidy contribution to maintain pool sustainability.
        </p>
      </div>
    </div>
  );
};

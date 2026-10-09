import React, { useState } from 'react';
import { Plus, Building2, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MapView } from '../map/MapView';
import { ProviderSummaryCards } from './ProviderSummaryCards';
import { ActiveLotsTable } from './ActiveLotsTable';
import { IncomingMatchesPanel } from './IncomingMatchesPanel';
import { DeliveryTrackingCard } from './DeliveryTrackingCard';
import { ListSurplusModal } from './ListSurplusModal';

export const ProviderDashboard: React.FC = () => {
  const { providers, selectedProviderId, setSelectedProviderId } = useAppStore();

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [mapPickerActive, setMapPickerActive] = useState(false);
  const [locationCallback, setLocationCallback] = useState<((lat: number, lng: number) => void) | null>(null);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  const handleEnableMapPick = (cb: (lat: number, lng: number) => void) => {
    setLocationCallback(() => cb);
    setMapPickerActive(true);
  };

  const handleLocationSelected = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });
    if (locationCallback) {
      locationCallback(lat, lng);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar: Provider switcher + List Surplus button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="provider-select" className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Active Provider:
              </label>
              <select
                id="provider-select"
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="font-bold text-sm sm:text-base text-stone-900 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {activeProvider.location.address}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsListModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-800 text-white rounded-2xl font-bold text-xs shadow-card transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>List Surplus Food</span>
        </button>
      </div>

      {/* Provider Summary Metrics */}
      <ProviderSummaryCards />

      {/* Split Layout: Map on one side, Panels on other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (5 cols) */}
        <div className="lg:col-span-5 h-[480px] lg:h-[680px] sticky top-20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Surrounding Receiver Demand Map
            </h4>
            <span className="text-[11px] text-stone-400">Pins colored by urgency</span>
          </div>
          <MapView
            selectionMode={mapPickerActive}
            selectedLocation={pickedLocation}
            onLocationSelect={handleLocationSelected}
          />
        </div>

        {/* Right Column: Active lots, Incoming matches, Delivery tracking (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Delivery Tracker if active */}
          <DeliveryTrackingCard />

          {/* Active lots table */}
          <ActiveLotsTable />

          {/* Incoming matches panel */}
          <IncomingMatchesPanel />
        </div>
      </div>

      {/* List Surplus Modal */}
      <ListSurplusModal
        isOpen={isListModalOpen}
        onClose={() => {
          setIsListModalOpen(false);
          setMapPickerActive(false);
        }}
        onEnableMapPick={handleEnableMapPick}
      />
    </div>
  );
};

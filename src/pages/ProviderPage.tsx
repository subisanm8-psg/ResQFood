import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, MapPin, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MapView } from '../components/map/MapView';
import { ProviderSummaryCards } from '../components/provider/ProviderSummaryCards';
import { ActiveLotsTable } from '../components/provider/ActiveLotsTable';
import { IncomingMatchesPanel } from '../components/provider/IncomingMatchesPanel';
import { DeliveryTrackingCard } from '../components/provider/DeliveryTrackingCard';
import { FoodBasketModal } from '../components/provider/FoodBasketModal';
import { GuidedTour } from '../components/common/GuidedTour';

export const ProviderPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    providers,
    selectedProviderId,
    setSelectedProviderId,
    currentUser,
    viewAsRole,
  } = useAppStore();

  const [isBasketModalOpen, setIsBasketModalOpen] = useState(false);

  // If logged in as Provider, find matching provider or fallback
  const activeProvider =
    providers.find((p) => p.id === (currentUser?.role === 'Provider' ? currentUser.entityId : selectedProviderId)) ||
    providers[0];

  return (
    <div className="space-y-6">
      {/* Guided Tour for Provider */}
      <GuidedTour role="Provider" />

      {/* Top Banner / Kitchen Identity Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-brown-border shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6 text-brown-primary" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display font-bold text-lg text-brown-primary">
                {activeProvider.name}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-butter-100 text-brown-primary border border-brown-border">
                {activeProvider.type}
              </span>
              {activeProvider.verificationStatus === 'Verified' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {t('common.verified')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {t('common.waitingApproval')}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brown-caramel" />
              {activeProvider.location.address} • {activeProvider.district}
            </p>
          </div>
        </div>

        {/* Action Button: List Extra Food Basket */}
        <div className="flex items-center gap-3">
          {/* Allow switching if demo or admin view */}
          {(!currentUser || currentUser.role === 'Admin') && (
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="font-bold text-xs text-brown-primary bg-butter-50 border border-brown-border rounded-xl px-2.5 py-2 focus:outline-none"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.district})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsBasketModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brown-primary hover:bg-brown-secondary text-cream rounded-2xl font-bold text-xs shadow-card transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-butter-300" />
            <span>{t('provider.listExtraFood')}</span>
          </button>
        </div>
      </div>

      {/* Provider Summary Tiles */}
      <ProviderSummaryCards />

      {/* Split Layout: Demand Map on one side, Management Panels on other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (5 cols) */}
        <div className="lg:col-span-5 h-[480px] lg:h-[680px] sticky top-20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-brown-primary uppercase tracking-wider">
              Tamil Nadu Redistribution Network
            </h4>
            <span className="text-[11px] text-stone-500">Live demand & courier routes</span>
          </div>
          <MapView />
        </div>

        {/* Right Column: Tracking, Active lots, Incoming matches (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Delivery Tracker if active */}
          <DeliveryTrackingCard />

          {/* Active food lots table */}
          <ActiveLotsTable />

          {/* Incoming receiver matches */}
          <IncomingMatchesPanel />
        </div>
      </div>

      {/* Multi-dish Food Basket Modal */}
      <FoodBasketModal
        isOpen={isBasketModalOpen}
        onClose={() => setIsBasketModalOpen(false)}
      />
    </div>
  );
};

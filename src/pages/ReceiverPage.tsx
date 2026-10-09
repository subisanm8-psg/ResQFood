import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Users, MapPin, HeartHandshake, CheckCircle2, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MapView } from '../components/map/MapView';
import { ReceiverProfileCard } from '../components/receiver/ReceiverProfileCard';
import { RequestStatusList } from '../components/receiver/RequestStatusList';
import { ProposalNotificationCard } from '../components/receiver/ProposalNotificationCard';
import { ReceiverDeliveryCard } from '../components/receiver/ReceiverDeliveryCard';
import { MultiRequestModal } from '../components/receiver/MultiRequestModal';
import { GuidedTour } from '../components/common/GuidedTour';

export const ReceiverPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    receivers,
    selectedReceiverId,
    setSelectedReceiverId,
    currentUser,
    matches,
    lots,
    requests,
    providers,
  } = useAppStore();

  const [isMultiRequestModalOpen, setIsMultiRequestModalOpen] = useState(false);

  // If logged in as Receiver, use that account's entityId or fallback
  const activeReceiver =
    receivers.find((r) => r.id === (currentUser?.role === 'Receiver' ? currentUser.entityId : selectedReceiverId)) ||
    receivers[0];

  // Active proposals for this receiver
  const pendingProposals = matches.filter((m) => {
    if (m.status !== 'Proposed') return false;
    const req = requests.find((r) => r.id === m.requestId);
    return req && req.receiverId === activeReceiver.id;
  });

  // Active deliveries for this receiver
  const activeDeliveries = matches.filter((m) => {
    if (m.status !== 'In Transit' && m.status !== 'Accepted') return false;
    const req = requests.find((r) => r.id === m.requestId);
    return req && req.receiverId === activeReceiver.id;
  });

  return (
    <div className="space-y-6">
      {/* Guided Tour for Receiver */}
      <GuidedTour role="Receiver" />

      {/* Top Identity Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-brown-border shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-brown-primary" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display font-bold text-lg text-brown-primary">
                {activeReceiver.name}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-butter-100 text-brown-primary border border-brown-border">
                {activeReceiver.organizationType} ({activeReceiver.headcount} people)
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cream text-brown-secondary border border-brown-border">
                {activeReceiver.affordabilityTier} Tier
              </span>
              {activeReceiver.verificationStatus === 'Verified' ? (
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
              {activeReceiver.location.address} • {activeReceiver.district}
            </p>
          </div>
        </div>

        {/* Action Button & Receiver switcher if demo */}
        <div className="flex items-center gap-3">
          {(!currentUser || currentUser.role === 'Admin') && (
            <select
              value={selectedReceiverId}
              onChange={(e) => setSelectedReceiverId(e.target.value)}
              className="font-bold text-xs text-brown-primary bg-butter-50 border border-brown-border rounded-xl px-2.5 py-2 focus:outline-none"
            >
              {receivers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.district})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsMultiRequestModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brown-primary hover:bg-brown-secondary text-cream rounded-2xl font-bold text-xs shadow-card transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-butter-300" />
            <span>{t('receiver.askForFood')}</span>
          </button>
        </div>
      </div>

      {/* Receiver Profile Detail Card */}
      <ReceiverProfileCard />

      {/* Split Layout: Map on one side, Management Panels on other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (5 cols) */}
        <div className="lg:col-span-5 h-[480px] lg:h-[680px] sticky top-20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-brown-primary uppercase tracking-wider">
              Surrounding Kitchen Surplus Map
            </h4>
            <span className="text-[11px] text-stone-500">Available food & ETA</span>
          </div>
          <MapView />
        </div>

        {/* Right Column: Deliveries, Proposals, and Request status (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Deliveries in transit */}
          {activeDeliveries.map((delivery) => {
            const lot = lots.find((l) => l.id === delivery.lotId);
            const provider = lot ? providers.find((p) => p.id === lot.providerId) : undefined;
            if (!lot || !provider) return null;

            return (
              <ReceiverDeliveryCard
                key={delivery.id}
                match={delivery}
                lot={lot}
                provider={provider}
              />
            );
          })}

          {/* Pending Proposals */}
          {pendingProposals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-brown-primary uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-brown-caramel" />
                  <span>{t('receiver.proposalsTitle')} ({pendingProposals.length})</span>
                </h4>
                <span className="text-[11px] text-stone-500">Review & accept to dispatch</span>
              </div>

              {pendingProposals.map((proposal) => {
                const lot = lots.find((l) => l.id === proposal.lotId);
                const req = requests.find((r) => r.id === proposal.requestId);
                const provider = lot ? providers.find((p) => p.id === lot.providerId) : undefined;

                if (!lot || !req || !provider) return null;

                return (
                  <ProposalNotificationCard
                    key={proposal.id}
                    match={proposal}
                    lot={lot}
                    request={req}
                    provider={provider}
                  />
                );
              })}
            </div>
          )}

          {/* Request Status List */}
          <RequestStatusList onNewRequest={() => setIsMultiRequestModalOpen(true)} />
        </div>
      </div>

      {/* Multi-Request Creation Modal */}
      <MultiRequestModal
        isOpen={isMultiRequestModalOpen}
        onClose={() => setIsMultiRequestModalOpen(false)}
      />
    </div>
  );
};

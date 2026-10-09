import React, { useState } from 'react';
import { Plus, Users, MapPin, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MapView } from '../map/MapView';
import { ReceiverProfileCard } from './ReceiverProfileCard';
import { NewRequestModal } from './NewRequestModal';
import { RequestStatusList } from './RequestStatusList';
import { ProposalNotificationCard } from './ProposalNotificationCard';
import { ReceiverDeliveryCard } from './ReceiverDeliveryCard';

export const ReceiverDashboard: React.FC = () => {
  const {
    receivers,
    selectedReceiverId,
    matches,
    lots,
    requests,
    providers,
  } = useAppStore();

  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const activeReceiver = receivers.find((r) => r.id === selectedReceiverId) || receivers[0];

  // Active proposals for this receiver
  const pendingProposals = matches.filter((m) => {
    if (m.status !== 'Proposed') return false;
    const req = requests.find((r) => r.id === m.requestId);
    return req && req.receiverId === selectedReceiverId;
  });

  // Active in-transit deliveries for this receiver
  const activeDeliveries = matches.filter((m) => {
    if (m.status !== 'In Transit' && m.status !== 'Accepted') return false;
    const req = requests.find((r) => r.id === m.requestId);
    return req && req.receiverId === selectedReceiverId;
  });

  return (
    <div className="space-y-6">
      {/* Receiver Profile Card */}
      <ReceiverProfileCard />

      {/* Split Layout: Map on one side, Panels on other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (5 cols) */}
        <div className="lg:col-span-5 h-[480px] lg:h-[680px] sticky top-20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Surplus Provider Network Map
            </h4>
            <span className="text-[11px] text-stone-400">Click pins for available surplus</span>
          </div>
          <MapView />
        </div>

        {/* Right Column: Proposals, Delivery tracking, and Request Status list (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Deliveries */}
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

          {/* Pending Proposals (Non-blocking cards) */}
          {pendingProposals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Proposed Surplus Allocations ({pendingProposals.length})
                </h4>
                <span className="text-[11px] text-stone-400">Review & accept to dispatch</span>
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
          <RequestStatusList onNewRequest={() => setIsNewRequestOpen(true)} />
        </div>
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
      />
    </div>
  );
};

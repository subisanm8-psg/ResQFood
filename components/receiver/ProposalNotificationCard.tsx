import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Match, FoodLot, FoodRequest, Provider } from '../../types';
import { MockPaymentModal } from './MockPaymentModal';

interface ProposalCardProps {
  match: Match;
  lot: FoodLot;
  request: FoodRequest;
  provider: Provider;
}

export const ProposalNotificationCard: React.FC<ProposalCardProps> = ({
  match,
  lot,
  request,
  provider,
}) => {
  const { t } = useTranslation();
  const { acceptMatch, declineMatch, subsidyPool } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('Portions not needed right now');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const expiryHours = match.scoreBreakdown.details?.timeUntilExpiryHours || 2.5;

  const handleAcceptClick = () => {
    const activePoolBalance = subsidyPool.currentBalance ?? subsidyPool.balance;
    if (match.priceBreakdown.tier === 'Low' && match.priceBreakdown.subsidyAmount > activePoolBalance) {
      setErrorMessage(
        `Help Fund Insufficient (₹${activePoolBalance.toFixed(2)} available, ₹${match.priceBreakdown.subsidyAmount.toFixed(2)} needed). Match paused.`
      );
      return;
    }
    setErrorMessage(null);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    const res = acceptMatch(match.id);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleConfirmDecline = () => {
    declineMatch(match.id, declineReason);
    setIsDeclining(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-brown-border shadow-card p-5 space-y-4 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-brown-caramel" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brown-primary">{t('receiver.proposalsTitle')}</h4>
            <p className="text-[11px] text-stone-500">{t('common.findingMatch')}</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-brown-primary bg-butter-100 border border-brown-border px-2.5 py-1 rounded-xl">
          {t('receiver.matchScore')}: {(match.score * 100).toFixed(0)}%
        </span>
      </div>

      {/* Error alert if subsidy blocked */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Help Fund Notice: </strong>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Core details */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="font-bold text-sm text-brown-primary">{lot.itemName}</h5>
            <p className="text-xs text-stone-600 mt-0.5">
              Offered by <span className="font-semibold text-stone-800">{provider.name}</span> ({provider.type})
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-brown-primary">
              {match.quantityAllocated} {lot.unit}
            </span>
            <span className="text-[11px] text-stone-400 block font-medium">allocated</span>
          </div>
        </div>

        {/* Distance, ETA, Expiry Margin */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-cream/70 rounded-2xl border border-brown-border text-[11px]">
          <div>
            <span className="text-stone-400 block text-[10px]">Distance</span>
            <span className="font-bold text-stone-800">{match.distanceKm} km</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">{t('receiver.liveEta')}</span>
            <span className="font-bold text-stone-800">{match.etaMinutes} mins</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">{t('common.useBefore')}</span>
            <span className="font-bold text-status-safe font-mono">+{expiryHours}h buffer</span>
          </div>
        </div>
      </div>

      {/* Price breakdown pill */}
      <div className="p-3 bg-cream/50 rounded-2xl border border-brown-border space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-stone-600">
          <span>{t('pricing.foodHandlingFee')}:</span>
          <span className="font-mono text-stone-700">₹{match.priceBreakdown.foodHandlingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-stone-600">
          <span>{t('pricing.deliveryCost')}:</span>
          <span className="font-mono text-stone-700">₹{match.priceBreakdown.deliveryCost.toFixed(2)}</span>
        </div>
        {match.priceBreakdown.tier === 'Low' && (
          <div className="flex justify-between items-center text-status-safe font-medium">
            <span>{t('pricing.helpFundApplied')}:</span>
            <span className="font-mono">-₹{match.priceBreakdown.subsidyAmount.toFixed(2)}</span>
          </div>
        )}
        {match.priceBreakdown.tier === 'High' && (
          <div className="flex justify-between items-center text-brown-caramel font-medium">
            <span>{t('pricing.helpFundContribution')}:</span>
            <span className="font-mono">+₹{Math.abs(match.priceBreakdown.subsidyAmount).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-brown-primary border-t border-brown-border pt-1.5">
          <span>{t('pricing.finalAmountDue')}:</span>
          <span className="font-mono text-sm text-brown-primary">
            ₹{match.priceBreakdown.finalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* "See how we chose this" expandable section */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-semibold text-brown-caramel hover:text-brown-primary flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{t('common.seeHowChose')}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-2 p-3 bg-white rounded-2xl border border-brown-border text-xs space-y-2 animate-in fade-in duration-150">
            <div className="font-semibold text-[11px] text-brown-primary">
              Algorithm Score Breakdown ({Math.round(match.score * 100)}% total fit):
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-cream rounded-xl border border-brown-border">
                <div className="text-stone-400 text-[10px]">Use-before Urgency</div>
                <div className="font-bold text-status-critical font-mono mt-0.5">
                  {(match.scoreBreakdown.expiryPressure * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2 bg-cream rounded-xl border border-brown-border">
                <div className="text-stone-400 text-[10px]">Proximity Distance</div>
                <div className="font-bold text-brown-caramel font-mono mt-0.5">
                  {((1 - match.scoreBreakdown.distanceNormalized) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2 bg-cream rounded-xl border border-brown-border">
                <div className="text-stone-400 text-[10px]">Headcount Fit</div>
                <div className="font-bold text-status-safe font-mono mt-0.5">
                  {(match.scoreBreakdown.quantityFit * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decline Dialog / Action Buttons */}
      {isDeclining ? (
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <label className="block text-[11px] font-semibold text-stone-700">
            Select reason for declining:
          </label>
          <select
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="w-full text-xs p-2 bg-white border border-stone-200 rounded-xl"
          >
            <option value="Portions not needed right now">Portions not needed right now</option>
            <option value="Dietary preference mismatch">Dietary preference mismatch</option>
            <option value="Delivery ETA too late">Delivery ETA too late</option>
            <option value="Kitchen capacity full">Kitchen capacity full</option>
          </select>
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => setIsDeclining(false)}
              className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
            >
              Back
            </button>
            <button
              onClick={handleConfirmDecline}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setIsDeclining(true)}
            className="flex-1 py-2.5 px-3 border border-brown-border rounded-xl font-bold text-xs text-brown-secondary hover:bg-cream transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4 text-stone-400" />
            <span>{t('receiver.notNow')}</span>
          </button>

          <button
            onClick={handleAcceptClick}
            className="flex-1 py-2.5 px-3 bg-butter-300 hover:bg-butter-400 text-brown-primary rounded-xl font-bold text-xs shadow-card transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-brown-primary" />
            <span>{t('receiver.accept')}</span>
          </button>
        </div>
      )}

      {/* Payment Settlement Modal */}
      <MockPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        priceBreakdown={match.priceBreakdown}
        providerName={provider.name}
        itemName={lot.itemName}
        quantity={match.quantityAllocated}
        unit={lot.unit}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};

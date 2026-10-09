import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PriceBreakdown } from '../../types';

interface MockPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceBreakdown: PriceBreakdown;
  providerName: string;
  itemName: string;
  quantity: number;
  unit: string;
  onConfirmPayment: () => void;
}

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  isOpen,
  onClose,
  priceBreakdown,
  providerName,
  itemName,
  quantity,
  unit,
  onConfirmPayment,
}) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setTimeout(() => {
        onConfirmPayment();
        setIsCompleted(false);
        onClose();
      }, 900);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-brown-border w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-brown-border flex items-center justify-between bg-butter-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-butter-300 text-brown-primary flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4 text-brown-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brown-primary">{t('pricing.title')}</h3>
              <p className="text-[11px] text-brown-secondary">Transparent subsidized delivery settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-brown-secondary hover:text-brown-primary hover:bg-butter-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-brown-primary text-base">Payment Verified!</h4>
            <p className="text-xs text-stone-500">
              Delivery van auto-assigned. Tracking in progress...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4 text-xs">
            {/* Order Summary */}
            <div className="p-3 bg-cream rounded-2xl border border-brown-border space-y-1">
              <div className="font-bold text-brown-primary text-xs">{itemName}</div>
              <div className="text-[11px] text-stone-500">
                {quantity} {unit} &bull; Prepared by {providerName}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 p-3 bg-cream/50 rounded-2xl border border-brown-border">
              <div className="flex justify-between text-stone-600">
                <span>{t('pricing.foodHandlingFee')}:</span>
                <span className="font-mono font-medium">₹{priceBreakdown.foodHandlingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t('pricing.deliveryCost')}:</span>
                <span className="font-mono font-medium">₹{priceBreakdown.deliveryCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-brown-primary border-t border-brown-border pt-1.5">
                <span>{t('pricing.baseTotal')}:</span>
                <span className="font-mono">₹{priceBreakdown.basePrice.toFixed(2)}</span>
              </div>

              {/* Help Fund Line */}
              {priceBreakdown.tier === 'Low' && (
                <div className="flex justify-between text-status-safe font-semibold bg-emerald-50/80 p-1.5 rounded-lg">
                  <span>{t('pricing.helpFundApplied')}:</span>
                  <span className="font-mono">-₹{priceBreakdown.subsidyAmount.toFixed(2)}</span>
                </div>
              )}

              {priceBreakdown.tier === 'High' && (
                <div className="flex justify-between text-brown-caramel font-semibold bg-butter-100/80 p-1.5 rounded-lg">
                  <span>{t('pricing.helpFundContribution')}:</span>
                  <span className="font-mono">+₹{Math.abs(priceBreakdown.subsidyAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-brown-primary border-t border-brown-border pt-2">
                <span>{t('pricing.finalAmountDue')}:</span>
                <span className="font-mono text-brown-primary text-base">
                  ₹{priceBreakdown.finalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Mock Payment Details */}
            <div className="p-3 bg-cream rounded-2xl border border-brown-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brown-caramel" />
                <span className="text-[11px] font-semibold text-brown-primary">{t('pricing.testPaymentNotice')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 border border-brown-border rounded-xl font-semibold text-brown-secondary hover:bg-cream transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-butter-300 hover:bg-butter-400 text-brown-primary rounded-xl font-bold shadow-card transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <span>{t('pricing.payAndDispatch')} (₹{priceBreakdown.finalAmount.toFixed(2)})</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface GuidedTourProps {
  role: 'Provider' | 'Receiver' | 'Admin';
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ role }) => {
  const { t } = useTranslation();
  const { completedTours, completeTour } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  // If already completed, don't show
  if (completedTours[role]) {
    return null;
  }

  const steps =
    role === 'Provider'
      ? [
          {
            title: 'Provider Kitchen Welcome',
            content: t('tour.step1Provider'),
          },
          {
            title: 'Instant Matching',
            content: t('tour.step2Provider'),
          },
          {
            title: 'Live Delivery Dispatch',
            content: t('tour.step3Provider'),
          },
        ]
      : role === 'Receiver'
      ? [
          {
            title: 'Community Home Welcome',
            content: t('tour.step1Receiver'),
          },
          {
            title: 'Reviewing Offers',
            content: t('tour.step2Receiver'),
          },
          {
            title: 'Confirming Safe Receipt',
            content: t('tour.step3Receiver'),
          },
        ]
      : [
          {
            title: 'Statewide Oversight',
            content: 'Monitor surplus distribution, verify trusted partners, and oversee the Help Fund across all 38 districts of Tamil Nadu.',
          },
          {
            title: 'Fair Allocation Engine',
            content: 'Audit matching scores, verify transport constraints, and export full ledger records in one click.',
          },
        ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour(role);
    }
  };

  const handleSkip = () => {
    completeTour(role);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center p-4">
        {/* Subtle backdrop */}
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-[2px] pointer-events-auto" onClick={handleSkip} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative pointer-events-auto w-full max-w-md bg-white border border-brown-border rounded-3xl p-6 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-brown-caramel" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brown-secondary">
                {role} Tour ({currentStep + 1}/{steps.length})
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-stone-400 hover:text-brown-primary p-1 rounded-lg transition-colors"
              title={t('tour.skip')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-display font-bold text-lg text-brown-primary mb-2">
            {steps[currentStep].title}
          </h3>

          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            {steps[currentStep].content}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <button
              onClick={handleSkip}
              className="text-xs font-medium text-stone-500 hover:text-brown-primary transition-colors py-2 px-3"
            >
              {t('tour.skip')}
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-butter-300 hover:bg-butter-400 text-brown-primary font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>{currentStep === steps.length - 1 ? t('tour.finish') : t('tour.next')}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

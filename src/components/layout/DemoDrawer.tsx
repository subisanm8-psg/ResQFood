import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  PlusCircle,
  Building,
  UserPlus,
  FilePlus2,
  Sparkles,
  TrendingUp,
  Clock,
  Compass,
  PackageCheck,
  Zap,
  MapPin,
  Eye,
  Shield,
  Building2,
  Users,
  FastForward,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { formatRupees } from '../../lib/currency';

interface DemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoDrawer: React.FC<DemoDrawerProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    isClockPlaying,
    clockSpeed,
    deliverySpeedMultiplier,
    matchingWeights,
    maxTravelDistanceKm,
    simulatedClock,
    subsidyPool,
    currentUser,
    viewAsRole,
    toggleClockPlay,
    setClockSpeed,
    setDeliverySpeedMultiplier,
    speedUpDelivery,
    setMatchingWeights,
    setMaxTravelDistanceKm,
    setViewAsRole,
    runSmartVsBaselineComparison,
    loadDemoScenario,
    quickSelectReceiver,
    addRandomProvider,
    addRandomReceiver,
    addRandomRequest,
    resetDemoData,
  } = useAppStore();

  const handleWeightChange = (key: 'wWaste' | 'wDist' | 'wDemand', value: number) => {
    const newWeights = { ...matchingWeights, [key]: value };
    setMatchingWeights(newWeights);
  };

  const formattedTime = new Date(simulatedClock).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleAdminViewAs = (role: 'Provider' | 'Receiver' | null) => {
    setViewAsRole(role);
    if (role === 'Provider') navigate('/provider');
    else if (role === 'Receiver') navigate('/receiver');
    else navigate('/admin');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900 z-50 backdrop-blur-xs"
          />

          {/* Drawer Body */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white z-50 shadow-2xl border-l border-brown-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 px-6 border-b border-brown-border flex items-center justify-between bg-butter-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-butter-300 text-brown-primary flex items-center justify-center font-bold text-sm">
                  <Sliders className="w-4 h-4 text-brown-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brown-primary">Demo Simulation Controls</h3>
                  <p className="text-[11px] text-brown-secondary">Live scenarios & algorithm tuning</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-stone-400 hover:text-brown-primary hover:bg-butter-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable controls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-stone-100 text-xs">
              {/* Section 0: Admin View As Previews */}
              {currentUser?.role === 'Admin' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-brown-caramel" />
                    Admin View-As Preview
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Preview the live application as Provider or Receiver without logging out.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAdminViewAs(null)}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all ${
                        viewAsRole === null
                          ? 'bg-brown-primary text-cream border-brown-primary'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => handleAdminViewAs('Provider')}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all ${
                        viewAsRole === 'Provider'
                          ? 'bg-brown-primary text-cream border-brown-primary'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Provider
                    </button>
                    <button
                      onClick={() => handleAdminViewAs('Receiver')}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all ${
                        viewAsRole === 'Receiver'
                          ? 'bg-brown-primary text-cream border-brown-primary'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Receiver
                    </button>
                  </div>
                </div>
              )}

              {/* Section 1: Scenario Presets */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brown-caramel" />
                    Preset Scenarios
                  </h4>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Seeds 6 Tamil Nadu providers, 8 receivers, urgent shelter, under-1hr expiry lot, Veg-only receiver, and split-order demand.
                </p>

                <button
                  onClick={loadDemoScenario}
                  className="w-full py-2.5 px-4 bg-butter-300 text-brown-primary font-bold rounded-xl hover:bg-butter-400 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Load Standard Demo Scenario
                </button>

                {/* Quick Receiver Switcher */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                    Quick Switch Receiver (Required Cases):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => quickSelectReceiver('low-charge')}
                      className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-left transition-colors"
                    >
                      <div className="font-bold text-emerald-900 text-[11px]">Low Charge Receiver</div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">Anbu Illam Orphanage (Nominal + Help Fund)</div>
                    </button>
                    <button
                      onClick={() => quickSelectReceiver('high-charge')}
                      className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-left transition-colors"
                    >
                      <div className="font-bold text-blue-900 text-[11px]">High Charge Receiver</div>
                      <div className="text-[10px] text-blue-700 mt-0.5">Tech Park Canteen (+25% Contribution)</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Max Travel Distance Filter */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brown-caramel" />
                    Max Travel Distance Filter
                  </h4>
                  <span className="font-mono font-bold text-brown-primary px-2 py-0.5 bg-butter-100 rounded-lg">
                    {maxTravelDistanceKm} km
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Matches beyond this range return reason "Too far" to ensure food does not spoil in transit.
                </p>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={maxTravelDistanceKm}
                  onChange={(e) => setMaxTravelDistanceKm(Number(e.target.value))}
                  className="w-full accent-brown-caramel"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>5 km (Local)</span>
                  <span>60 km (Default)</span>
                  <span>150 km (Regional)</span>
                </div>
              </div>

              {/* Section 3: Simulated Clock Engine */}
              <div className="pt-6 space-y-3">
                <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brown-caramel" />
                  Simulated Clock Engine
                </h4>

                <div className="p-3 bg-cream rounded-xl border border-brown-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-400 font-medium">Virtual Network Time</div>
                    <div className="text-xs font-mono font-bold text-stone-800 mt-0.5">{formattedTime}</div>
                  </div>
                  <button
                    onClick={toggleClockPlay}
                    className={`p-2 rounded-xl text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                      isClockPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isClockPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isClockPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-600 text-[11px] font-medium">Clock Speed Multiplier:</span>
                  <div className="flex gap-1.5">
                    {[1, 10, 60].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setClockSpeed(speed)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          clockSpeed === speed
                            ? 'bg-brown-primary text-cream shadow-sm'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-stone-600 text-[11px] font-medium">Courier Transit Speed:</span>
                  <div className="flex gap-1.5">
                    {[1, 5, 15].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setDeliverySpeedMultiplier(speed)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          deliverySpeedMultiplier === speed
                            ? 'bg-brown-caramel text-white shadow-sm'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Up Delivery Button per Fix 4 spec */}
                <div className="pt-2">
                  <button
                    onClick={() => speedUpDelivery()}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Speed up this delivery (+35%)</span>
                  </button>
                </div>

                {/* Live Help Fund Balance per Fix 3 spec */}
                <div className="p-3 bg-butter-100/90 rounded-xl border border-brown-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-brown-secondary font-medium">Help Fund Balance</div>
                    <div className="text-sm font-display font-bold text-brown-primary mt-0.5">
                      {formatRupees(subsidyPool.balance, i18n.language)}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-butter-200 text-brown-primary font-bold">
                    Live Pool
                  </span>
                </div>
              </div>

              {/* Section 4: Algorithm Weight Sliders */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brown-caramel" />
                    Matching Objective Weights
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">Sum: 100%</span>
                </div>

                <p className="text-[11px] text-stone-500">
                  Sliders auto-normalize and immediately re-score active candidate surplus lots.
                </p>

                {/* wWaste */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-status-critical" />
                      wWaste (Expiry Urgency):
                    </span>
                    <span className="font-mono font-bold text-brown-primary">
                      {Math.round(matchingWeights.wWaste * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={matchingWeights.wWaste}
                    onChange={(e) => handleWeightChange('wWaste', parseFloat(e.target.value))}
                    className="w-full accent-brown-caramel"
                  />
                </div>

                {/* wDist */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-blue-600" />
                      wDist (Distance Proximity):
                    </span>
                    <span className="font-mono font-bold text-brown-primary">
                      {Math.round(matchingWeights.wDist * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={matchingWeights.wDist}
                    onChange={(e) => handleWeightChange('wDist', parseFloat(e.target.value))}
                    className="w-full accent-brown-caramel"
                  />
                </div>

                {/* wDemand */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <PackageCheck className="w-3 h-3 text-status-safe" />
                      wDemand (Quantity Fit):
                    </span>
                    <span className="font-mono font-bold text-brown-primary">
                      {Math.round(matchingWeights.wDemand * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={matchingWeights.wDemand}
                    onChange={(e) => handleWeightChange('wDemand', parseFloat(e.target.value))}
                    className="w-full accent-brown-caramel"
                  />
                </div>
              </div>

              {/* Section 5: Comparative Benchmark */}
              <div className="pt-6 space-y-3">
                <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brown-caramel" />
                  Comparative Benchmark
                </h4>

                <button
                  onClick={runSmartVsBaselineComparison}
                  className="w-full py-2.5 px-4 bg-brown-primary text-cream font-semibold rounded-xl hover:bg-brown-secondary transition-all shadow-card flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-butter-300" />
                  Run Smart vs Baseline Replay
                </button>
              </div>

              {/* Section 6: Dynamic Entity Injection */}
              <div className="pt-6 space-y-3">
                <h4 className="font-bold text-brown-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-brown-caramel" />
                  Dynamically Inject Entities
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={addRandomProvider}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-cream flex items-center gap-2 text-stone-700 transition-colors"
                  >
                    <Building className="w-4 h-4 text-brown-primary" />
                    <span>Add Random Provider</span>
                  </button>
                  <button
                    onClick={addRandomReceiver}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-cream flex items-center gap-2 text-stone-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>Add Random Receiver</span>
                  </button>
                  <button
                    onClick={addRandomRequest}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-cream flex items-center gap-2 text-stone-700 transition-colors"
                  >
                    <FilePlus2 className="w-4 h-4 text-emerald-600" />
                    <span>Add Random Food Request</span>
                  </button>
                </div>
              </div>

              {/* Section 7: Reset State */}
              <div className="pt-6">
                <button
                  onClick={resetDemoData}
                  className="w-full py-2 px-3 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl font-medium transition-colors border border-rose-200"
                >
                  Reset All State & Storage
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

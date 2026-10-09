import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Utensils,
  HeartHandshake,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
  Coins,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Logo } from '../components/common/Logo';
import { formatRupees } from '../lib/currency';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { lots, matches, subsidyPool, providers, receivers } = useAppStore();

  // Calculate live impact stats
  const totalLots = lots.length;
  const deliveredMeals = matches
    .filter((m) => m.status === 'Delivered')
    .reduce((sum, m) => sum + m.quantityAllocated, 1850); // fallback to initial benchmark

  const activeDistricts = new Set([
    ...providers.map((p) => p.district || 'Coimbatore'),
    ...receivers.map((r) => r.district || 'Coimbatore'),
  ]).size;

  const helpFundBalance = subsidyPool.currentBalance ?? subsidyPool.balance;

  return (
    <div className="min-h-screen bg-cream text-brown-primary flex flex-col font-sans selection:bg-butter-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-brown-border">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-butter-200/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-butter-100/50 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-butter-200 border border-brown-border text-xs font-bold text-brown-primary tracking-wide">
            <Sparkles className="w-4 h-4 text-brown-caramel" />
            <span>{t('brand.shortTagline')}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-brown-primary leading-tight max-w-4xl mx-auto">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-base sm:text-xl text-brown-secondary max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/auth?role=provider&mode=signup')}
              className="px-6 py-3.5 bg-brown-primary hover:bg-brown-secondary text-cream font-bold text-sm rounded-2xl shadow-card transition-all active:scale-95 flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>{t('landing.ctaListFood')}</span>
            </button>

            <button
              onClick={() => navigate('/auth?role=receiver&mode=signup')}
              className="px-6 py-3.5 bg-butter-300 hover:bg-butter-400 text-brown-primary font-bold text-sm rounded-2xl shadow-card transition-all active:scale-95 flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t('landing.ctaAskFood')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Impact Numbers Bar */}
      <section className="bg-white border-b border-brown-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brown-caramel">
              {t('landing.liveImpactTitle')}
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-cream border border-brown-border">
              <p className="text-2xl sm:text-3xl font-display font-bold text-brown-primary">
                {totalLots}
              </p>
              <p className="text-xs font-medium text-brown-secondary mt-1">
                {t('landing.statFoodSaved')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-brown-border">
              <p className="text-2xl sm:text-3xl font-display font-bold text-status-safe">
                {deliveredMeals.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-brown-secondary mt-1">
                {t('landing.statDelivered')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-brown-border">
              <p className="text-2xl sm:text-3xl font-display font-bold text-brown-primary">
                {formatRupees(helpFundBalance, i18n.language)}
              </p>
              <p className="text-xs font-medium text-brown-secondary mt-1">
                {t('landing.statHelpFund')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-brown-border">
              <p className="text-2xl sm:text-3xl font-display font-bold text-brown-caramel">
                {activeDistricts}
              </p>
              <p className="text-xs font-medium text-brown-secondary mt-1">
                {t('landing.statDistricts')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps: How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-brown-primary">
            {t('landing.howItWorksTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border border-brown-border shadow-card hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold mb-4">
              <Utensils className="w-6 h-6 text-brown-primary" />
            </div>
            <h3 className="font-display font-bold text-lg text-brown-primary mb-2">
              {t('landing.step1Title')}
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {t('landing.step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border border-brown-border shadow-card hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-butter-300 text-brown-primary flex items-center justify-center font-bold mb-4">
              <Sparkles className="w-6 h-6 text-brown-primary" />
            </div>
            <h3 className="font-display font-bold text-lg text-brown-primary mb-2">
              {t('landing.step2Title')}
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {t('landing.step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border border-brown-border shadow-card hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold mb-4">
              <Truck className="w-6 h-6 text-brown-primary" />
            </div>
            <h3 className="font-display font-bold text-lg text-brown-primary mb-2">
              {t('landing.step3Title')}
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {t('landing.step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Role Access Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-butter-100/50 border-t border-brown-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-brown-primary">
              {t('landing.rolesTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Provider Card */}
            <div className="bg-white p-7 rounded-3xl border border-brown-border shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-brown-primary mb-2">
                  {t('landing.providerRoleTitle')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {t('landing.providerRoleDesc')}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-stone-100">
                <button
                  onClick={() => navigate('/auth?role=provider&mode=login')}
                  className="w-full py-2.5 bg-brown-primary hover:bg-brown-secondary text-cream font-bold text-xs rounded-xl transition-all"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => navigate('/auth?role=provider&mode=signup')}
                  className="w-full py-2.5 bg-butter-100 hover:bg-butter-200 text-brown-primary font-bold text-xs rounded-xl border border-brown-border transition-all"
                >
                  {t('nav.signup')}
                </button>
              </div>
            </div>

            {/* Receiver Card */}
            <div className="bg-white p-7 rounded-3xl border border-brown-border shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-brown-primary mb-2">
                  {t('landing.receiverRoleTitle')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {t('landing.receiverRoleDesc')}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-stone-100">
                <button
                  onClick={() => navigate('/auth?role=receiver&mode=login')}
                  className="w-full py-2.5 bg-brown-primary hover:bg-brown-secondary text-cream font-bold text-xs rounded-xl transition-all"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => navigate('/auth?role=receiver&mode=signup')}
                  className="w-full py-2.5 bg-butter-100 hover:bg-butter-200 text-brown-primary font-bold text-xs rounded-xl border border-brown-border transition-all"
                >
                  {t('nav.signup')}
                </button>
              </div>
            </div>

            {/* Admin Card */}
            <div className="bg-white p-7 rounded-3xl border border-brown-border shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-brown-primary mb-2">
                  {t('landing.adminRoleTitle')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {t('landing.adminRoleDesc')}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-stone-100">
                <button
                  onClick={() => navigate('/auth?role=admin&mode=login')}
                  className="w-full py-2.5 bg-brown-primary hover:bg-brown-secondary text-cream font-bold text-xs rounded-xl transition-all"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => navigate('/auth?role=admin&mode=signup')}
                  className="w-full py-2.5 bg-butter-100 hover:bg-butter-200 text-brown-primary font-bold text-xs rounded-xl border border-brown-border transition-all"
                >
                  {t('nav.signup')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 text-center border-t border-brown-border bg-white text-xs text-stone-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Logo size="sm" />
        </div>
        <p>{t('landing.footerText')}</p>
      </footer>
    </div>
  );
};

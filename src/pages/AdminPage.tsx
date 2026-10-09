import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Building2,
  Users,
  Coins,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sliders,
  MapPin,
  Search,
  ExternalLink,
  Ban,
  Check,
  TrendingUp,
  Map as MapIcon,
  Truck,
  Navigation,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TN_DISTRICTS } from '../data/tamilnadu';
import { MapView } from '../components/map/MapView';
import { ImpactAnalytics } from '../components/analytics/ImpactAnalytics';
import { GuidedTour } from '../components/common/GuidedTour';
import { formatRupees } from '../lib/currency';

export const AdminPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ta' ? 'ta' : 'en') as 'en' | 'ta';
  const navigate = useNavigate();

  const {
    providers,
    receivers,
    lots,
    requests,
    deliveryPartners,
    matches,
    subsidyPool,
    maxTravelDistanceKm,
    setMaxTravelDistanceKm,
    verifyUser,
    suspendUser,
    setViewAsRole,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'partners' | 'map' | 'analytics'>('partners');
  const [partnerSubTab, setPartnerSubTab] = useState<'providers' | 'receivers'>('providers');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Overview metrics
  const totalProviders = providers.length;
  const totalReceivers = receivers.length;
  const totalFoodLots = lots.length;
  const deliveredMeals = matches
    .filter((m) => m.status === 'Delivered')
    .reduce((sum, m) => sum + m.quantityAllocated, 1850);
  const wastedFood = lots.reduce((sum, l) => sum + l.quantityWasted, 0);
  const helpFundBalance = subsidyPool.currentBalance ?? subsidyPool.balance;

  // Filtered lists
  const filteredProviders = providers.filter((p) => {
    const matchesDistrict = districtFilter === 'ALL' || p.district?.toLowerCase() === districtFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const filteredReceivers = receivers.filter((r) => {
    const matchesDistrict = districtFilter === 'ALL' || r.district?.toLowerCase() === districtFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const handleViewAsProvider = () => {
    setViewAsRole('Provider');
    navigate('/provider');
  };

  const handleViewAsReceiver = () => {
    setViewAsRole('Receiver');
    navigate('/receiver');
  };

  return (
    <div className="space-y-6">
      {/* Guided Tour for Admin */}
      <GuidedTour role="Admin" />

      {/* Top Banner with Admin Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-brown-border shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold">
            <Shield className="w-6 h-6 text-brown-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-brown-primary">
              {t('admin.dashboardTitle')}
            </h2>
            <p className="text-xs text-stone-500">
              Statewide administrative console & Help Fund supervisory ledger
            </p>
          </div>
        </div>

        {/* View-As Shortcuts for Admin */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewAsProvider}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cream hover:bg-butter-100 text-brown-primary border border-brown-border rounded-xl font-bold text-xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-brown-caramel" />
            <span>{t('admin.viewAsProvider')}</span>
          </button>

          <button
            onClick={handleViewAsReceiver}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cream hover:bg-butter-100 text-brown-primary border border-brown-border rounded-xl font-bold text-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-brown-caramel" />
            <span>{t('admin.viewAsReceiver')}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-brown-border shadow-card">
          <span className="text-[11px] font-semibold text-stone-500 block">{t('admin.totalProviders')}</span>
          <p className="text-2xl font-display font-bold text-brown-primary mt-1">{totalProviders}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-brown-border shadow-card">
          <span className="text-[11px] font-semibold text-stone-500 block">{t('admin.totalReceivers')}</span>
          <p className="text-2xl font-display font-bold text-brown-primary mt-1">{totalReceivers}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-brown-border shadow-card">
          <span className="text-[11px] font-semibold text-stone-500 block">{t('admin.totalFoodListed')}</span>
          <p className="text-2xl font-display font-bold text-brown-primary mt-1">{totalFoodLots} lots</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-brown-border shadow-card">
          <span className="text-[11px] font-semibold text-stone-500 block">{t('admin.totalDelivered')}</span>
          <p className="text-2xl font-display font-bold text-status-safe mt-1">{deliveredMeals.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-brown-border shadow-card">
          <span className="text-[11px] font-semibold text-stone-500 block">{t('admin.totalWasted')}</span>
          <p className="text-2xl font-display font-bold text-status-critical mt-1">{wastedFood} kg/pt</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-brown-border shadow-card">
          <span className="text-[11px] font-semibold text-stone-500 block">{t('admin.helpFundBalance')}</span>
          <p className="text-2xl font-display font-bold text-brown-caramel mt-1">{formatRupees(helpFundBalance, currentLang)}</p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-brown-border space-x-2">
        <button
          onClick={() => setActiveTab('partners')}
          className={`py-2.5 px-4 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'partners'
              ? 'bg-white text-brown-primary border-t border-x border-brown-border -mb-px'
              : 'text-stone-500 hover:text-brown-primary hover:bg-cream'
          }`}
        >
          <Building2 className="w-4 h-4 text-brown-caramel" />
          <span>Partners & Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`py-2.5 px-4 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'map'
              ? 'bg-white text-brown-primary border-t border-x border-brown-border -mb-px'
              : 'text-stone-500 hover:text-brown-primary hover:bg-cream'
          }`}
        >
          <MapIcon className="w-4 h-4 text-brown-caramel" />
          <span>Statewide Network & Distance</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2.5 px-4 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-brown-primary border-t border-x border-brown-border -mb-px'
              : 'text-stone-500 hover:text-brown-primary hover:bg-cream'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-brown-caramel" />
          <span>Impact Benchmarks & Ledger</span>
        </button>
      </div>

      {/* Tab 1: Partners & Verification Directory */}
      {activeTab === 'partners' && (
        <div className="bg-white rounded-3xl border border-brown-border shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Sub-tabs: Providers vs Receivers */}
            <div className="flex items-center gap-2 bg-cream p-1 rounded-2xl border border-brown-border">
              <button
                onClick={() => setPartnerSubTab('providers')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  partnerSubTab === 'providers'
                    ? 'bg-brown-primary text-cream shadow-xs'
                    : 'text-stone-600 hover:text-brown-primary'
                }`}
              >
                {t('admin.providersTable')} ({filteredProviders.length})
              </button>
              <button
                onClick={() => setPartnerSubTab('receivers')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  partnerSubTab === 'receivers'
                    ? 'bg-brown-primary text-cream shadow-xs'
                    : 'text-stone-600 hover:text-brown-primary'
                }`}
              >
                {t('admin.receiversTable')} ({filteredReceivers.length})
              </button>
            </div>

            {/* Filters: District & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-cream border border-brown-border rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-brown-caramel"
                />
              </div>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-cream border border-brown-border rounded-xl text-brown-primary font-medium focus:outline-none"
              >
                <option value="ALL">All Districts ({TN_DISTRICTS.length})</option>
                {TN_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {currentLang === 'ta' ? d.nameTa : d.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Providers Table */}
          {partnerSubTab === 'providers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/60 border-b border-brown-border text-brown-secondary uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Provider Name & Type</th>
                    <th className="py-3 px-3">Owner / Contact</th>
                    <th className="py-3 px-3">District & Location</th>
                    <th className="py-3 px-3">FSSAI License</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brown-primary">{p.name}</div>
                        <span className="text-[11px] text-stone-500">{p.type}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-stone-800 font-medium">{p.ownerName}</div>
                        <div className="text-[11px] text-stone-400">{p.phone}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-stone-800 font-medium">{p.district}</div>
                        <div className="text-[11px] text-stone-400 truncate max-w-[160px]">{p.address}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-stone-600">
                        {p.fssaiNumber || 'Exempt / Not Provided'}
                      </td>
                      <td className="py-3.5 px-3">
                        {p.verificationStatus === 'Verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {t('common.verified')}
                          </span>
                        ) : p.verificationStatus === 'Suspended' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
                            <Ban className="w-3 h-3 text-red-600" />
                            {t('common.suspended')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {t('common.waitingApproval')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.verificationStatus !== 'Verified' && (
                            <button
                              onClick={() => verifyUser(p.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{t('admin.verifyBtn')}</span>
                            </button>
                          )}
                          {p.verificationStatus !== 'Suspended' && (
                            <button
                              onClick={() => suspendUser(p.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>{t('admin.suspendBtn')}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receivers Table */}
          {partnerSubTab === 'receivers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/60 border-b border-brown-border text-brown-secondary uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Community Home & Type</th>
                    <th className="py-3 px-3">Contact Person</th>
                    <th className="py-3 px-3">Headcount</th>
                    <th className="py-3 px-3">Tier</th>
                    <th className="py-3 px-3">District</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredReceivers.map((r) => (
                    <tr key={r.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brown-primary">{r.name}</div>
                        <span className="text-[11px] text-stone-500">{r.organizationType}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-stone-800 font-medium">{r.contactPerson}</div>
                        <div className="text-[11px] text-stone-400">{r.phone}</div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-stone-900">
                        {r.headcount} people
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-butter-100 text-brown-primary border border-brown-border">
                          {r.affordabilityTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-stone-800 font-medium">{r.district}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {r.verificationStatus === 'Verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {t('common.verified')}
                          </span>
                        ) : r.verificationStatus === 'Suspended' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
                            <Ban className="w-3 h-3 text-red-600" />
                            {t('common.suspended')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {t('common.waitingApproval')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.verificationStatus !== 'Verified' && (
                            <button
                              onClick={() => verifyUser(r.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{t('admin.verifyBtn')}</span>
                            </button>
                          )}
                          {r.verificationStatus !== 'Suspended' && (
                            <button
                              onClick={() => suspendUser(r.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>{t('admin.suspendBtn')}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Statewide Network Map & Distance Control */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-brown-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-sm text-brown-primary">
                {t('admin.maxTravelDistance')}
              </h3>
              <p className="text-xs text-stone-500">
                Matches farther than this threshold are marked "Too far" to preserve food safety.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={maxTravelDistanceKm}
                onChange={(e) => setMaxTravelDistanceKm(Number(e.target.value))}
                className="w-48 accent-brown-caramel"
              />
              <span className="font-display font-bold text-sm text-brown-primary px-3 py-1 bg-butter-100 border border-brown-border rounded-xl">
                {maxTravelDistanceKm} km
              </span>
            </div>
          </div>

          <div className="h-[640px] rounded-3xl overflow-hidden border border-brown-border shadow-card">
            <MapView />
          </div>

          {/* Active Deliveries List per Fix 4 spec */}
          <div className="bg-white p-5 rounded-3xl border border-brown-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-butter-200 text-brown-primary flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4 text-brown-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-brown-primary">Active Deliveries in Transit</h3>
                  <p className="text-xs text-stone-500">Live courier tracking across Tamil Nadu redistributions</p>
                </div>
              </div>
              <span className="text-xs font-bold text-brown-caramel px-2.5 py-1 bg-butter-100 rounded-xl border border-brown-border">
                {matches.filter((m) => m.delivery && (m.status === 'In Transit' || m.delivery.status !== 'Delivered')).length} active
              </span>
            </div>

            {matches.filter((m) => m.delivery && (m.status === 'In Transit' || m.delivery.status !== 'Delivered')).length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center italic">
                No deliveries currently in transit. Accept an offer to dispatch courier.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches
                  .filter((m) => m.delivery && (m.status === 'In Transit' || m.delivery.status !== 'Delivered'))
                  .map((m) => {
                    const lot = lots.find((l) => l.id === m.lotId);
                    const req = requests.find((r) => r.id === m.requestId);
                    const receiver = req ? receivers.find((rc) => rc.id === req.receiverId) : undefined;
                    const provider = lot ? providers.find((p) => p.id === lot.providerId) : undefined;
                    const partner = deliveryPartners.find((dp) => dp.id === m.deliveryPartnerId);
                    const progressVal = Math.round((m.delivery?.progress ?? 0) * 100);

                    return (
                      <div key={m.id} className="p-3.5 bg-cream/60 rounded-2xl border border-brown-border space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-xs text-brown-primary">{lot?.itemName}</div>
                            <div className="text-[11px] text-stone-500">
                              {provider?.name} &rarr; {receiver?.name}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-butter-200 text-brown-primary border border-brown-border">
                            {m.delivery?.status || 'In Transit'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-stone-500">{partner?.companyName} ({partner?.vehicleType})</span>
                            <span className="font-bold text-brown-primary">{progressVal}%</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-brown-caramel h-full transition-all duration-300 rounded-full"
                              style={{ width: `${progressVal}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-stone-400 pt-0.5">
                          <span>Driver: {partner?.driverName}</span>
                          <span>ETA: ~{Math.max(1, Math.round(m.etaMinutes * (1 - (m.delivery?.progress ?? 0))))} mins</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Impact Benchmark & Help Fund Ledger */}
      {activeTab === 'analytics' && <ImpactAnalytics />}
    </div>
  );
};

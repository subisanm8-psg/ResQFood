import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  EyeOff,
  Building2,
  Users,
  Shield,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Logo } from '../components/common/Logo';
import { TN_DISTRICTS } from '../data/tamilnadu';
import { UserRole } from '../types';
import { changeLanguage } from '../i18n';

export const AuthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ta' ? 'ta' : 'en') as 'en' | 'ta';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { login, signup, accounts } = useAppStore();

  // Get initial role & mode from query params
  const paramRole = searchParams.get('role');
  const initialRole: UserRole =
    paramRole === 'provider' ? 'Provider' : paramRole === 'receiver' ? 'Receiver' : 'Admin';

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Provider specific
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [ownerName, setOwnerName] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');

  // Receiver specific
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('NGO');
  const [headcount, setHeadcount] = useState('40');
  const [contactPerson, setContactPerson] = useState('');
  const [affordabilityTier, setAffordabilityTier] = useState<'Low' | 'Medium' | 'High'>('Low');

  // Shared location & phone
  const [district, setDistrict] = useState('Coimbatore');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Admin specific
  const [adminName, setAdminName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Validation & status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Sync params on tab change
  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage(null);
    setFieldErrors({});
    setSearchParams({ role: role.toLowerCase(), mode: authMode });
  };

  const handleModeChange = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setErrorMessage(null);
    setFieldErrors({});
    setSearchParams({ role: activeTab.toLowerCase(), mode });
  };

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutTimer) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (!prev || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleToggleLanguage = () => {
    const nextLang = i18n.language === 'ta' ? 'en' : 'ta';
    changeLanguage(nextLang);
  };

  // One-click demo login helper
  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string, demoRole: UserRole) => {
    setActiveTab(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setFieldErrors({});

    const res = await login(demoEmail, demoPass, demoRole);
    if (res.success) {
      if (demoRole === 'Provider') navigate('/provider');
      else if (demoRole === 'Receiver') navigate('/receiver');
      else navigate('/admin');
    } else if (res.error) {
      setErrorMessage(t(res.error));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errs.email = t('auth.errorEmailFormat');
    }

    // Password
    if (!password || password.length < 8) {
      errs.password = t('auth.errorPasswordLength');
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        errs.confirmPassword = t('auth.errorPasswordMismatch');
      }

      if (activeTab === 'Admin') {
        if (inviteCode.trim() !== 'RESQ-ADMIN-2026') {
          errs.inviteCode = t('auth.errorInviteCode');
        }
        if (!adminName.trim()) {
          errs.adminName = 'Admin name is required';
        }
      } else {
        // Phone
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          errs.phone = t('auth.errorPhoneDigits');
        }

        if (activeTab === 'Provider' && !businessName.trim()) {
          errs.businessName = 'Business name is required';
        }
        if (activeTab === 'Receiver' && !orgName.trim()) {
          errs.orgName = 'Organisation name is required';
        }
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await login(email, password, activeTab);
        if (res.success) {
          if (activeTab === 'Provider') navigate('/provider');
          else if (activeTab === 'Receiver') navigate('/receiver');
          else navigate('/admin');
        } else if (res.error) {
          if (res.error === 'auth.errorAccountLocked') {
            setLockoutTimer(30);
          }
          // If error is wrong role, check if we should auto-switch tab
          if (res.error === 'auth.errorWrongRoleProvider') {
            setActiveTab('Provider');
          } else if (res.error === 'auth.errorWrongRoleReceiver') {
            setActiveTab('Receiver');
          } else if (res.error === 'auth.errorWrongRoleAdmin') {
            setActiveTab('Admin');
          }
          setErrorMessage(t(res.error));
        }
      } else {
        // Sign up
        const signupPayload = {
          role: activeTab,
          email,
          password,
          displayName:
            activeTab === 'Provider'
              ? businessName
              : activeTab === 'Receiver'
              ? orgName
              : adminName,
          extra:
            activeTab === 'Provider'
              ? {
                  businessType,
                  ownerName,
                  phone,
                  district,
                  address,
                  fssaiNumber,
                }
              : activeTab === 'Receiver'
              ? {
                  orgType,
                  headcount: parseInt(headcount) || 40,
                  contactPerson,
                  phone,
                  district,
                  address,
                  affordabilityTier,
                }
              : {
                  inviteCode,
                },
        };

        const res = await signup(signupPayload);
        if (res.success) {
          if (activeTab === 'Provider') navigate('/provider');
          else if (activeTab === 'Receiver') navigate('/receiver');
          else navigate('/admin');
        } else if (res.error) {
          if (res.error === 'auth.errorEmailExists') {
            // Section 3: If email already exists, show message and switch to login form
            setAuthMode('login');
            setErrorMessage(t('auth.errorEmailExists'));
          } else {
            setErrorMessage(t(res.error));
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-brown-primary flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Top Navbar Header with Logo and Language Toggle */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>
        <button
          onClick={handleToggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brown-border text-xs font-bold text-brown-primary hover:bg-butter-100 transition-colors shadow-xs"
        >
          <Globe className="w-3.5 h-3.5 text-brown-caramel" />
          <span>{i18n.language === 'ta' ? 'English' : 'தமிழ்'}</span>
        </button>
      </div>

      <div className="w-full max-w-xl bg-white border border-brown-border rounded-3xl shadow-card overflow-hidden">
        {/* Role Tabs */}
        <div className="grid grid-cols-3 bg-butter-100 border-b border-brown-border p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => handleTabChange('Admin')}
            className={`py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'Admin'
                ? 'bg-brown-primary text-cream shadow-sm'
                : 'text-brown-primary hover:bg-butter-200/70'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{t('auth.adminTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('Provider')}
            className={`py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'Provider'
                ? 'bg-brown-primary text-cream shadow-sm'
                : 'text-brown-primary hover:bg-butter-200/70'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t('auth.providerTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('Receiver')}
            className={`py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'Receiver'
                ? 'bg-brown-primary text-cream shadow-sm'
                : 'text-brown-primary hover:bg-butter-200/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('auth.receiverTab')}</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="font-display font-bold text-2xl text-brown-primary">
              {authMode === 'login' ? t('auth.loginTitle') : t('auth.signupTitle')}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Role: <span className="font-bold text-brown-caramel">{activeTab}</span>
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lockout Notice */}
          {lockoutTimer && (
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {t('auth.errorAccountLocked')} Retry in {lockoutTimer}s.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Provider Sign Up Fields */}
            {authMode === 'signup' && activeTab === 'Provider' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.businessNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Annapoorna Bhavan"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    />
                    {fieldErrors.businessName && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.businessTypeLabel')}
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    >
                      <option value="Restaurant">Restaurant</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Caterer">Caterer</option>
                      <option value="Canteen">Canteen</option>
                      <option value="Wedding hall">Wedding hall</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.ownerNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Owner or Manager Name"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.fssaiLabel')}
                    </label>
                    <input
                      type="text"
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      placeholder="e.g. 12423001000123"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Receiver Sign Up Fields */}
            {authMode === 'signup' && activeTab === 'Receiver' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.orgNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Anbu Illam Orphanage"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    />
                    {fieldErrors.orgName && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.orgName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.orgTypeLabel')}
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    >
                      <option value="Orphanage">Orphanage</option>
                      <option value="Old Age Home">Old Age Home</option>
                      <option value="NGO">NGO</option>
                      <option value="Community Kitchen">Community Kitchen</option>
                      <option value="School or Hostel">School or Hostel</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Village Community">Village Community</option>
                      <option value="Religious Community">Religious Community</option>
                      <option value="Corporate Canteen">Corporate Canteen</option>
                      <option value="Event Organiser">Event Organiser</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.headcountLabel')}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={headcount}
                      onChange={(e) => setHeadcount(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('auth.contactPersonLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Contact Person Name"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('auth.affordabilityLabel')}
                  </label>
                  <select
                    value={affordabilityTier}
                    onChange={(e) => setAffordabilityTier(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                  >
                    <option value="Low">Very little (Nominal fee with Help Fund coverage)</option>
                    <option value="Medium">Some (Standard base delivery fee)</option>
                    <option value="High">Full price (Base fee plus 25% Help Fund contribution)</option>
                  </select>
                </div>
              </>
            )}

            {/* Admin Sign Up Fields */}
            {authMode === 'signup' && activeTab === 'Admin' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('auth.adminNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Full Name"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                  />
                  {fieldErrors.adminName && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.adminName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('auth.adminInviteCodeLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="RESQ-ADMIN-2026"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel uppercase"
                  />
                  {fieldErrors.inviteCode && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.inviteCode}</p>
                  )}
                </div>
              </>
            )}

            {/* Shared Phone & Location for Provider and Receiver Sign up */}
            {authMode === 'signup' && activeTab !== 'Admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('auth.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('auth.districtLabel')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.nameEn}>
                        {currentLang === 'ta' ? d.nameTa : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('auth.addressLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street or Area"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t('auth.emailLabel')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t('auth.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 pr-10 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-brown-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Sign up only) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || Boolean(lockoutTimer)}
              className="w-full py-3 bg-brown-primary hover:bg-brown-secondary disabled:bg-stone-300 text-cream font-bold text-sm rounded-xl shadow-card transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              <span>{authMode === 'login' ? t('auth.loginButton') : t('auth.signupButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login / Signup Mode */}
          <div className="text-center mt-6 pt-4 border-t border-stone-100">
            {authMode === 'login' ? (
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="text-xs font-semibold text-brown-caramel hover:text-brown-primary transition-colors"
              >
                {t('auth.newHere')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-xs font-semibold text-brown-caramel hover:text-brown-primary transition-colors"
              >
                {t('auth.alreadyAccount')}
              </button>
            )}
          </div>

          {/* One-click Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-brown-border">
            <p className="text-xs font-bold uppercase tracking-wider text-brown-secondary mb-3 text-center">
              {t('auth.useDemoAccount')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@resqfood.org', 'Admin@123', 'Admin')}
                className="p-2.5 rounded-xl bg-cream hover:bg-butter-100 border border-brown-border text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-brown-primary">{t('auth.demoAdminBtn')}</p>
                  <p className="text-[11px] text-stone-500">admin@resqfood.org</p>
                </div>
                <KeyRound className="w-4 h-4 text-brown-caramel" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('annapoorna@resqfood.org', 'Provider@123', 'Provider')}
                className="p-2.5 rounded-xl bg-cream hover:bg-butter-100 border border-brown-border text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-brown-primary">{t('auth.demoProviderBtn')}</p>
                  <p className="text-[11px] text-stone-500">annapoorna@resqfood.org</p>
                </div>
                <KeyRound className="w-4 h-4 text-brown-caramel" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('anbuillam@resqfood.org', 'Receiver@123', 'Receiver')}
                className="p-2.5 rounded-xl bg-cream hover:bg-butter-100 border border-brown-border text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-brown-primary">{t('auth.demoLowReceiverBtn')}</p>
                  <p className="text-[11px] text-stone-500">anbuillam@resqfood.org</p>
                </div>
                <KeyRound className="w-4 h-4 text-brown-caramel" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('tcs@resqfood.org', 'Receiver@123', 'Receiver')}
                className="p-2.5 rounded-xl bg-cream hover:bg-butter-100 border border-brown-border text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-brown-primary">{t('auth.demoHighReceiverBtn')}</p>
                  <p className="text-[11px] text-stone-500">tcs@resqfood.org</p>
                </div>
                <KeyRound className="w-4 h-4 text-brown-caramel" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

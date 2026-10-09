import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  SlidersHorizontal,
  User,
  LogOut,
  Globe,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Truck,
  Trash2,
  X,
  ChevronDown,
  Shield,
  Building2,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Logo } from '../common/Logo';
import { changeLanguage } from '../../i18n';

interface NavbarProps {
  onOpenDemoDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoDrawer }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const {
    currentUser,
    logout,
    notifications,
    dismissNotification,
    clearAllNotifications,
    simulatedClock,
    isClockPlaying,
    clockSpeed,
    toggleClockPlay,
    viewAsRole,
    setViewAsRole,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeNotifs = notifications.filter((n) => !n.dismissed);

  const formatClock = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '12:00:00';
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = i18n.language === 'ta' ? 'en' : 'ta';
    changeLanguage(nextLang);
  };

  const activeRole = viewAsRole || currentUser?.role;

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-brown-border px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Logo size="md" />

          {/* Admin "View As" indicator banner */}
          {currentUser?.role === 'Admin' && viewAsRole && (
            <div className="hidden sm:flex items-center gap-2 bg-butter-200 border border-brown-border px-3 py-1 rounded-xl text-xs font-bold text-brown-primary">
              <span>Previewing as {viewAsRole}</span>
              <button
                onClick={() => setViewAsRole(null)}
                className="text-[11px] underline text-brown-caramel hover:text-brown-primary ml-1"
              >
                Back to Admin
              </button>
            </div>
          )}
        </div>

        {/* Navigation & Role Access */}
        <nav className="hidden md:flex items-center gap-2">
          {currentUser ? (
            <>
              {activeRole === 'Provider' && (
                <Link
                  to="/provider"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-brown-primary hover:bg-butter-100 transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-brown-caramel" />
                  <span>{t('nav.providerDashboard')}</span>
                </Link>
              )}
              {activeRole === 'Receiver' && (
                <Link
                  to="/receiver"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-brown-primary hover:bg-butter-100 transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-brown-caramel" />
                  <span>{t('nav.receiverDashboard')}</span>
                </Link>
              )}
              {currentUser.role === 'Admin' && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-brown-primary hover:bg-butter-100 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-brown-caramel" />
                  <span>{t('nav.adminDashboard')}</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-brown-primary hover:bg-butter-100 transition-colors"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/auth"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-brown-primary bg-butter-200 hover:bg-butter-300 transition-colors"
              >
                {t('nav.login')} / {t('nav.signup')}
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions: English | தமிழ் Toggle, Clock, Notifications, Profile, Demo Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Section 2: English | தமிழ் Toggle */}
          <button
            onClick={handleToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brown-border hover:bg-butter-50 rounded-xl text-xs font-bold text-brown-primary shadow-subtle transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-brown-caramel" />
            <span>{i18n.language === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>

          {/* Simulated Clock Ticker Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-white border border-brown-border px-3 py-1.5 rounded-xl text-xs text-brown-primary shadow-subtle">
            <button
              onClick={toggleClockPlay}
              className="text-brown-secondary hover:text-brown-primary transition-colors p-0.5"
              title={isClockPlaying ? 'Pause Clock' : 'Resume Clock'}
            >
              {isClockPlaying ? (
                <Pause className="w-3.5 h-3.5 text-status-amber" />
              ) : (
                <Play className="w-3.5 h-3.5 text-status-green" />
              )}
            </button>
            <span className="font-mono font-bold text-brown-primary">
              {formatClock(simulatedClock)}
            </span>
            <span className="text-[10px] text-brown-caramel font-mono font-semibold">
              ({clockSpeed}x)
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-brown-primary bg-white hover:bg-butter-50 transition-colors border border-brown-border shadow-subtle"
              title={t('nav.notifications')}
            >
              <Bell className="w-4 h-4" />
              {activeNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-status-red text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {activeNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevation border border-brown-border p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-brown-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-brown-primary">{t('nav.notifications')}</h4>
                    <span className="text-[10px] bg-butter-100 text-brown-primary px-2 py-0.5 rounded-full font-semibold">
                      {activeNotifs.length}
                    </span>
                  </div>
                  {activeNotifs.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-brown-secondary hover:text-status-red flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-brown-100 py-1">
                  {activeNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-brown-300">
                      No new notifications
                    </div>
                  ) : (
                    activeNotifs.map((n) => (
                      <div
                        key={n.id}
                        className="py-2.5 flex items-start gap-2.5 text-xs hover:bg-butter-50/60 p-1.5 rounded-xl transition-colors"
                      >
                        <div className="p-1 rounded-lg bg-butter-100 mt-0.5 text-brown-primary">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brown-primary text-[11px]">{n.title}</p>
                          <p className="text-[11px] text-brown-secondary leading-snug mt-0.5">
                            {n.message}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="text-brown-300 hover:text-brown-primary p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-brown-border hover:bg-butter-50 transition-colors shadow-subtle text-brown-primary text-xs font-bold"
              >
                <div className="w-6 h-6 rounded-full bg-butter-300 text-brown-primary flex items-center justify-center font-bold text-xs">
                  {currentUser.displayName.charAt(0)}
                </div>
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {currentUser.displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-brown-caramel" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevation border border-brown-border p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2 border-b border-brown-100">
                    <p className="text-xs font-bold text-brown-primary truncate">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[11px] text-brown-secondary truncate mt-0.5">
                      {currentUser.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-butter-100 text-brown-primary">
                        {currentUser.role}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentUser.verificationStatus === 'Verified'
                            ? 'bg-status-green/10 text-status-green'
                            : 'bg-status-amber/15 text-status-amber'
                        }`}
                      >
                        {currentUser.verificationStatus}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    {currentUser.role === 'Provider' && (
                      <Link
                        to="/provider"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-medium text-brown-primary hover:bg-butter-50 block transition-colors"
                      >
                        {t('nav.providerDashboard')}
                      </Link>
                    )}
                    {currentUser.role === 'Receiver' && (
                      <Link
                        to="/receiver"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-medium text-brown-primary hover:bg-butter-50 block transition-colors"
                      >
                        {t('nav.receiverDashboard')}
                      </Link>
                    )}
                    {currentUser.role === 'Admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-medium text-brown-primary hover:bg-butter-50 block transition-colors"
                      >
                        {t('nav.adminDashboard')}
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold text-status-red hover:bg-red-50 flex items-center gap-1.5 transition-colors pt-2 border-t border-brown-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-3.5 py-1.5 bg-brown-primary hover:bg-brown-secondary text-butter-100 rounded-xl text-xs font-bold transition-all shadow-card"
            >
              {t('nav.login')}
            </Link>
          )}

          {/* Demo Controls Button */}
          <button
            onClick={onOpenDemoDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-butter-300 hover:bg-butter-200 text-brown-primary rounded-xl text-xs font-bold transition-all shadow-card border border-brown-border active:scale-95"
            title={t('nav.demoControls')}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.demoControls')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

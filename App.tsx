import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/layout/Navbar';
import { DemoDrawer } from './components/layout/DemoDrawer';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ProviderPage } from './pages/ProviderPage';
import { ReceiverPage } from './pages/ReceiverPage';
import { AdminPage } from './pages/AdminPage';
import { UserRole } from './types';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole: UserRole;
}> = ({ children, allowedRole }) => {
  const { currentUser, viewAsRole } = useAppStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={`/auth?role=${allowedRole.toLowerCase()}&mode=login`} state={{ from: location }} replace />;
  }

  // Admin previewing as other roles
  if (currentUser.role === 'Admin') {
    return <>{children}</>;
  }

  // Normal user check
  if (currentUser.role !== allowedRole) {
    if (currentUser.role === 'Provider') return <Navigate to="/provider" replace />;
    if (currentUser.role === 'Receiver') return <Navigate to="/receiver" replace />;
    if (currentUser.role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Layout component
const AppLayout: React.FC = () => {
  const { isClockPlaying, tickSimulatedClock, lots, requests, matches } = useAppStore();
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const location = useLocation();

  // Simulated Clock ticker effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (isClockPlaying) {
        tickSimulatedClock(1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockPlaying, tickSimulatedClock]);

  // Initial scenario seeding if store has lots & requests but no matches
  useEffect(() => {
    if (lots.length > 0 && requests.length > 0 && matches.length === 0) {
      useAppStore.getState().loadDemoScenario();
    }
  }, []);

  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-cream text-brown-primary flex flex-col font-sans antialiased selection:bg-butter-200">
      {/* Top Navbar (hidden on dedicated auth page for cleaner login focus) */}
      {!isAuthPage && (
        <Navbar onOpenDemoDrawer={() => setIsDemoDrawerOpen(true)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth Page */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Provider Dashboard */}
              <Route
                path="/provider"
                element={
                  <ProtectedRoute allowedRole="Provider">
                    <ProviderPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Receiver Dashboard */}
              <Route
                path="/receiver"
                element={
                  <ProtectedRoute allowedRole="Receiver">
                    <ReceiverPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="Admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Demo Controls Drawer */}
      <DemoDrawer
        isOpen={isDemoDrawerOpen}
        onClose={() => setIsDemoDrawerOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;

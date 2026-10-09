import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  FoodLot,
  FoodRequest,
  Provider,
  Receiver,
  Match,
  DeliveryPartner,
  SubsidyPool,
  Notification,
  MatchingWeights,
  WasteReason,
  UserAccount,
  UserRole,
  UserVerificationStatus,
} from '../types';
import {
  SEED_PROVIDERS,
  SEED_RECEIVERS,
  SEED_FOOD_LOTS,
  SEED_REQUESTS,
  SEED_DELIVERY_PARTNERS,
  INITIAL_HELP_FUND,
  BASE_SIMULATION_TIME,
  SEED_ACCOUNTS,
} from './seedData';
import {
  DEFAULT_WEIGHTS,
  DEFAULT_MAX_TRAVEL_DISTANCE_KM,
  runSmartMatching,
  runBaselineMatching,
  calculateComparisonMetrics,
  normalizeWeights,
} from '../lib/matcher';
import { calculateDistanceKm } from '../lib/distance';
import { hasSufficientSubsidy } from '../lib/pricing';
import { hashPassword, verifyPassword } from '../lib/authCrypto';
import { BasketDishRow } from '../lib/basketValidation';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppState {
  // Session & Authentication
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  viewAsRole: UserRole | null; // For Admin previewing as Provider or Receiver

  // Entities
  selectedProviderId: string;
  selectedReceiverId: string;
  providers: Provider[];
  receivers: Receiver[];
  lots: FoodLot[];
  requests: FoodRequest[];
  matches: Match[];
  deliveryPartners: DeliveryPartner[];
  subsidyPool: SubsidyPool; // Help Fund
  notifications: Notification[];

  // Settings & Controls
  matchingWeights: MatchingWeights;
  maxTravelDistanceKm: number; // default 60 km
  simulatedClock: string;
  isClockPlaying: boolean;
  clockSpeed: number; // 1, 10, 60
  deliverySpeedMultiplier: number; // 1 to 15x
  toasts: ToastMessage[];
  completedTours: Record<string, boolean>; // userId or role -> boolean
  comparisonMetrics: ReturnType<typeof calculateComparisonMetrics>;

  // Auth Actions
  login: (email: string, password: string, selectedRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (signupData: {
    role: UserRole;
    email: string;
    password: string;
    displayName: string;
    extra: Record<string, any>;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setViewAsRole: (role: UserRole | null) => void;
  setSelectedProviderId: (id: string) => void;
  setSelectedReceiverId: (id: string) => void;
  completeTour: (role: string) => void;

  // Admin Actions
  verifyUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  setMaxTravelDistanceKm: (km: number) => void;

  // Provider Multi-Dish Actions
  listMultiDishBasket: (
    pickupDetails: { address: string; lat: number; lng: number; district?: string; phone: string; specialNotes?: string },
    dishRows: BasketDishRow[]
  ) => void;
  listSurplusLot: (lot: Omit<FoodLot, 'id' | 'quantityWasted' | 'status'>) => void;
  updateLot: (lotId: string, updates: Partial<FoodLot>) => void;
  withdrawLot: (lotId: string) => void;
  logWaste: (lotId: string, quantityWasted: number, reason: WasteReason) => void;

  // Receiver Multi-Request Actions
  createMultiFoodRequests: (
    newRequests: Omit<FoodRequest, 'id' | 'quantityReceived' | 'status' | 'createdAt'>[]
  ) => void;
  createFoodRequest: (req: Omit<FoodRequest, 'id' | 'quantityReceived' | 'status' | 'createdAt'>) => void;
  acceptMatch: (matchId: string) => { success: boolean; error?: string };
  declineMatch: (matchId: string, reason: string) => void;
  confirmDeliveryReceived: (matchId: string, deliveredQty?: number) => void;

  // Simulation Controls
  setMatchingWeights: (weights: MatchingWeights) => void;
  setDeliverySpeedMultiplier: (speed: number) => void;
  toggleClockPlay: () => void;
  setClockSpeed: (speed: number) => void;
  tickSimulatedClock: (deltaSeconds: number) => void;
  runSmartVsBaselineComparison: () => void;
  loadDemoScenario: () => void;
  quickSelectReceiver: (type: 'low-charge' | 'high-charge') => void;
  addRandomProvider: () => void;
  addRandomReceiver: () => void;
  addRandomRequest: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  resetDemoData: () => void;
}

const initialBaseline = runBaselineMatching({
  lots: SEED_FOOD_LOTS,
  requests: SEED_REQUESTS,
  providers: SEED_PROVIDERS,
  receivers: SEED_RECEIVERS,
  currentTime: BASE_SIMULATION_TIME,
  maxTravelDistanceKm: DEFAULT_MAX_TRAVEL_DISTANCE_KM,
});

const initialComparison = calculateComparisonMetrics({
  smartMatches: [],
  baselineResult: initialBaseline,
  lots: SEED_FOOD_LOTS,
  requests: SEED_REQUESTS,
  receivers: SEED_RECEIVERS,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: SEED_ACCOUNTS[0], // Default logged in as admin or switchable
      accounts: SEED_ACCOUNTS,
      viewAsRole: null,
      selectedProviderId: SEED_PROVIDERS[0].id,
      selectedReceiverId: SEED_RECEIVERS[0].id,
      providers: SEED_PROVIDERS,
      receivers: SEED_RECEIVERS,
      lots: SEED_FOOD_LOTS,
      requests: SEED_REQUESTS,
      matches: [],
      deliveryPartners: SEED_DELIVERY_PARTNERS,
      subsidyPool: INITIAL_HELP_FUND,
      notifications: [],
      matchingWeights: DEFAULT_WEIGHTS,
      maxTravelDistanceKm: DEFAULT_MAX_TRAVEL_DISTANCE_KM,
      simulatedClock: BASE_SIMULATION_TIME,
      isClockPlaying: true,
      clockSpeed: 1,
      deliverySpeedMultiplier: 1,
      toasts: [],
      completedTours: {},
      comparisonMetrics: initialComparison,

      // Authentication
      login: async (email, password, selectedRole) => {
        const state = get();
        const account = state.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase().trim());

        if (!account) {
          return { success: false, error: 'auth.errorInvalidCredentials' };
        }

        // Check if locked
        if (account.lockedUntil && account.lockedUntil > Date.now()) {
          return { success: false, error: 'auth.errorAccountLocked' };
        }

        // Section 3: If person logs in under wrong role, tell them and select correct tab
        if (account.role !== selectedRole) {
          return {
            success: false,
            error:
              account.role === 'Provider'
                ? 'auth.errorWrongRoleProvider'
                : account.role === 'Receiver'
                ? 'auth.errorWrongRoleReceiver'
                : 'auth.errorWrongRoleAdmin',
          };
        }

        const isMatch = await verifyPassword(password, account.salt, account.passwordHash);
        if (!isMatch) {
          const failed = (account.failedLoginAttempts || 0) + 1;
          const lockedUntil = failed >= 5 ? Date.now() + 30000 : undefined; // Lock for 30 seconds

          const updatedAccounts = state.accounts.map((a) =>
            a.id === account.id ? { ...a, failedLoginAttempts: failed, lockedUntil } : a
          );
          set({ accounts: updatedAccounts });

          if (failed >= 5) {
            return { success: false, error: 'auth.errorAccountLocked' };
          }
          return { success: false, error: 'auth.errorInvalidCredentials' };
        }

        // Reset failed login attempts on success
        const updatedAccounts = state.accounts.map((a) =>
          a.id === account.id ? { ...a, failedLoginAttempts: 0, lockedUntil: undefined } : a
        );

        set({
          currentUser: account,
          accounts: updatedAccounts,
          viewAsRole: null,
          selectedProviderId: account.role === 'Provider' ? account.entityId : state.selectedProviderId,
          selectedReceiverId: account.role === 'Receiver' ? account.entityId : state.selectedReceiverId,
        });

        return { success: true };
      },

      signup: async (signupData) => {
        const state = get();
        const normalizedEmail = signupData.email.toLowerCase().trim();

        // Check if email already exists
        const existing = state.accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
        if (existing) {
          return { success: false, error: 'auth.errorEmailExists' };
        }

        const { hash, salt } = await hashPassword(signupData.password);
        const entityId = `entity-${Date.now()}`;
        const accountId = `user-${Date.now()}`;

        const newAccount: UserAccount = {
          id: accountId,
          email: normalizedEmail,
          passwordHash: hash,
          salt,
          role: signupData.role,
          entityId,
          displayName: signupData.displayName,
          verificationStatus: 'Waiting for approval', // New sign ups are Waiting for approval
          failedLoginAttempts: 0,
          createdAt: new Date().toISOString(),
        };

        // Create entity
        if (signupData.role === 'Provider') {
          const newProvider: Provider = {
            id: entityId,
            name: signupData.displayName,
            type: signupData.extra.businessType || 'Restaurant',
            ownerName: signupData.extra.ownerName || signupData.displayName,
            location: {
              lat: signupData.extra.lat || 11.0168,
              lng: signupData.extra.lng || 76.9558,
              address: signupData.extra.address || 'Tamil Nadu',
              district: signupData.extra.district || 'Coimbatore',
            },
            district: signupData.extra.district || 'Coimbatore',
            address: signupData.extra.address || 'Tamil Nadu',
            phone: signupData.extra.phone || '9876543210',
            email: normalizedEmail,
            fssaiNumber: signupData.extra.fssaiNumber,
            verificationStatus: 'Waiting for approval',
          };
          set({
            providers: [...state.providers, newProvider],
            selectedProviderId: newProvider.id,
          });
        } else if (signupData.role === 'Receiver') {
          const newReceiver: Receiver = {
            id: entityId,
            name: signupData.displayName,
            organizationType: signupData.extra.orgType || 'NGO',
            headcount: signupData.extra.headcount || 40,
            contactPerson: signupData.extra.contactPerson || signupData.displayName,
            location: {
              lat: signupData.extra.lat || 11.0168,
              lng: signupData.extra.lng || 76.9558,
              address: signupData.extra.address || 'Tamil Nadu',
              district: signupData.extra.district || 'Coimbatore',
            },
            district: signupData.extra.district || 'Coimbatore',
            address: signupData.extra.address || 'Tamil Nadu',
            phone: signupData.extra.phone || '9876543210',
            email: normalizedEmail,
            affordabilityTier: signupData.extra.affordabilityTier || 'Low',
            monthlyBudget: signupData.extra.affordabilityTier === 'High' ? 45000 : 5000,
            vulnerabilityScore: signupData.extra.affordabilityTier === 'Low' ? 0.9 : 0.4,
            verificationStatus: 'Waiting for approval',
          };
          set({
            receivers: [...state.receivers, newReceiver],
            selectedReceiverId: newReceiver.id,
          });
        }

        set((s) => ({
          accounts: [...s.accounts, newAccount],
          currentUser: newAccount,
          viewAsRole: null,
        }));

        return { success: true };
      },

      logout: () => {
        set({ currentUser: null, viewAsRole: null });
      },

      setViewAsRole: (role) => set({ viewAsRole: role }),

      setSelectedProviderId: (id) => set({ selectedProviderId: id }),

      setSelectedReceiverId: (id) => set({ selectedReceiverId: id }),

      completeTour: (role) => {
        set((state) => ({
          completedTours: { ...state.completedTours, [role]: true },
        }));
      },

      // Admin verification
      verifyUser: (userId) => {
        set((state) => {
          const updatedAccounts = state.accounts.map((a) =>
            a.id === userId ? { ...a, verificationStatus: 'Verified' as UserVerificationStatus } : a
          );
          const account = state.accounts.find((a) => a.id === userId);
          let updatedProviders = state.providers;
          let updatedReceivers = state.receivers;

          if (account?.role === 'Provider') {
            updatedProviders = state.providers.map((p) =>
              p.id === account.entityId ? { ...p, verificationStatus: 'Verified' as UserVerificationStatus } : p
            );
          } else if (account?.role === 'Receiver') {
            updatedReceivers = state.receivers.map((r) =>
              r.id === account.entityId ? { ...r, verificationStatus: 'Verified' as UserVerificationStatus } : r
            );
          }

          return {
            accounts: updatedAccounts,
            providers: updatedProviders,
            receivers: updatedReceivers,
          };
        });
        get().addToast('success', 'toasts.userVerified', 'Partner verified.');
      },

      suspendUser: (userId) => {
        set((state) => {
          const updatedAccounts = state.accounts.map((a) =>
            a.id === userId ? { ...a, verificationStatus: 'Suspended' as UserVerificationStatus } : a
          );
          const account = state.accounts.find((a) => a.id === userId);
          let updatedProviders = state.providers;
          let updatedReceivers = state.receivers;

          if (account?.role === 'Provider') {
            updatedProviders = state.providers.map((p) =>
              p.id === account.entityId ? { ...p, verificationStatus: 'Suspended' as UserVerificationStatus } : p
            );
          } else if (account?.role === 'Receiver') {
            updatedReceivers = state.receivers.map((r) =>
              r.id === account.entityId ? { ...r, verificationStatus: 'Suspended' as UserVerificationStatus } : r
            );
          }

          return {
            accounts: updatedAccounts,
            providers: updatedProviders,
            receivers: updatedReceivers,
          };
        });
        get().addToast('warning', 'toasts.userSuspended', 'Partner suspended.');
      },

      setMaxTravelDistanceKm: (km) => {
        set({ maxTravelDistanceKm: km });
        get().setMatchingWeights(get().matchingWeights);
      },

      // Section 8: Multi-Dish Food Basket Listing
      listMultiDishBasket: (pickupDetails, dishRows) => {
        const state = get();
        const activeProvider = state.providers.find((p) => p.id === state.selectedProviderId) || state.providers[0];

        // Update provider location & phone if edited
        const updatedProviders = state.providers.map((p) =>
          p.id === activeProvider.id
            ? {
                ...p,
                phone: pickupDetails.phone || p.phone,
                location: {
                  ...p.location,
                  address: pickupDetails.address || p.location.address,
                  lat: pickupDetails.lat || p.location.lat,
                  lng: pickupDetails.lng || p.location.lng,
                },
              }
            : p
        );

        const newLots: FoodLot[] = dishRows.map((row, idx) => ({
          id: `lot-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          providerId: activeProvider.id,
          dishId: row.dishId,
          itemName: row.dishName,
          foodType: row.foodType,
          category: 'Cooked meal',
          quantityTotal: row.quantity,
          quantityRemaining: row.quantity,
          unit: row.unit,
          quantityWasted: 0,
          preparedAt: row.preparedTime,
          expiryAt: row.useBeforeTime,
          status: 'Available',
          specialNotes: pickupDetails.specialNotes,
        }));

        const updatedLots = [...newLots, ...state.lots];

        // Trigger smart matcher automatically
        const matchResult = runSmartMatching({
          lots: updatedLots,
          requests: state.requests,
          providers: updatedProviders,
          receivers: state.receivers,
          currentTime: state.simulatedClock,
          weights: state.matchingWeights,
          maxTravelDistanceKm: state.maxTravelDistanceKm,
          existingMatches: state.matches,
        });

        set({
          providers: updatedProviders,
          lots: matchResult.updatedLots,
          requests: matchResult.updatedRequests,
          matches: matchResult.matches,
        });

        state.addToast('success', 'toasts.dishesListed', `${newLots.length} dishes listed successfully.`);
        get().runSmartVsBaselineComparison();
      },

      listSurplusLot: (lotData) => {
        const state = get();
        const activeProvider = state.providers.find((p) => p.id === lotData.providerId) || state.providers[0];
        get().listMultiDishBasket(
          {
            address: activeProvider.location.address,
            lat: activeProvider.location.lat,
            lng: activeProvider.location.lng,
            district: activeProvider.district,
            phone: activeProvider.phone || '9876543210',
            specialNotes: lotData.specialNotes,
          },
          [
            {
              dishId: lotData.dishId || 'custom',
              dishName: lotData.itemName,
              foodType: lotData.foodType,
              quantity: lotData.quantityTotal,
              unit: lotData.unit,
              preparedTime: lotData.preparedAt,
              useBeforeTime: lotData.expiryAt,
            },
          ]
        );
      },

      updateLot: (lotId, updates) => {
        set((state) => ({
          lots: state.lots.map((l) => (l.id === lotId ? { ...l, ...updates } : l)),
        }));
        get().setMatchingWeights(get().matchingWeights);
      },

      withdrawLot: (lotId) => {
        set((state) => ({
          lots: state.lots.filter((l) => l.id !== lotId),
          matches: state.matches.filter((m) => m.lotId !== lotId),
        }));
        get().addToast('info', 'toasts.lotWithdrawn', 'Lot withdrawn.');
        get().runSmartVsBaselineComparison();
      },

      logWaste: (lotId, quantityWasted, reason) => {
        const state = get();
        const lot = state.lots.find((l) => l.id === lotId);
        if (!lot) return;

        const updatedWasted = Math.min(lot.quantityTotal, lot.quantityWasted + quantityWasted);
        const updatedRemaining = Math.max(0, lot.quantityRemaining - quantityWasted);
        const isFullyWasted = updatedRemaining === 0;

        const updatedLots = state.lots.map((l) =>
          l.id === lotId
            ? {
                ...l,
                quantityWasted: updatedWasted,
                quantityRemaining: updatedRemaining,
                wasteReason: reason,
                status: isFullyWasted ? ('Wasted' as const) : l.status,
              }
            : l
        );

        set({ lots: updatedLots });
        state.addToast('warning', 'toasts.wasteLogged', `Recorded ${quantityWasted} ${lot.unit} wasted.`);
        get().runSmartVsBaselineComparison();
      },

      // Section 8: Multi-Request Receiver Creation
      createMultiFoodRequests: (newRequestsData) => {
        const state = get();
        const newRequests: FoodRequest[] = newRequestsData.map((data, idx) => ({
          ...data,
          id: `req-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          quantityReceived: 0,
          status: 'Waiting',
          createdAt: state.simulatedClock,
        }));

        const updatedRequests = [...newRequests, ...state.requests];

        const matchResult = runSmartMatching({
          lots: state.lots,
          requests: updatedRequests,
          providers: state.providers,
          receivers: state.receivers,
          currentTime: state.simulatedClock,
          weights: state.matchingWeights,
          maxTravelDistanceKm: state.maxTravelDistanceKm,
          existingMatches: state.matches,
        });

        set({
          requests: matchResult.updatedRequests,
          lots: matchResult.updatedLots,
          matches: matchResult.matches,
        });

        state.addToast('success', 'toasts.requestsPublished', `${newRequests.length} requests published.`);
        get().runSmartVsBaselineComparison();
      },

      createFoodRequest: (reqData) => {
        get().createMultiFoodRequests([reqData]);
      },

      acceptMatch: (matchId) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return { success: false, error: 'Match not found' };

        const lot = state.lots.find((l) => l.id === match.lotId);
        const req = state.requests.find((r) => r.id === match.requestId);
        const receiver = req ? state.receivers.find((r) => r.id === req.receiverId) : undefined;
        const provider = lot ? state.providers.find((p) => p.id === lot.providerId) : undefined;

        if (!lot || !req || !receiver || !provider) {
          return { success: false, error: 'Associated entities missing' };
        }

        // Check Help Fund sufficiency for Low tier
        if (receiver.affordabilityTier === 'Low' && match.priceBreakdown.subsidyAmount > 0) {
          const check = hasSufficientSubsidy(
            state.subsidyPool.balance,
            match.priceBreakdown.subsidyAmount
          );
          if (!check.sufficient) {
            state.addToast(
              'error',
              'Help Fund Insufficient',
              `Required Rs. ${match.priceBreakdown.subsidyAmount.toFixed(0)}, but fund balance is only Rs. ${state.subsidyPool.balance.toFixed(0)}.`
            );
            return {
              success: false,
              error: `Help Fund insufficient (Rs. ${state.subsidyPool.balance.toFixed(0)} available, Rs. ${match.priceBreakdown.subsidyAmount.toFixed(0)} needed).`,
            };
          }
        }

        // Auto-assign nearest available delivery partner whose capacity fits allocated qty
        const availablePartners = state.deliveryPartners.filter(
          (p) => p.status === 'Available' && p.capacity >= match.quantityAllocated
        );

        let assignedPartner: DeliveryPartner | undefined;
        if (availablePartners.length > 0) {
          availablePartners.sort((a, b) => {
            const distA = calculateDistanceKm(
              a.currentLocation.lat,
              a.currentLocation.lng,
              provider.location.lat,
              provider.location.lng
            );
            const distB = calculateDistanceKm(
              b.currentLocation.lat,
              b.currentLocation.lng,
              provider.location.lat,
              provider.location.lng
            );
            return distA - distB;
          });
          assignedPartner = availablePartners[0];
        } else {
          assignedPartner =
            state.deliveryPartners.find((p) => p.capacity >= match.quantityAllocated) ||
            state.deliveryPartners[0];
        }

        // Update Help Fund
        let updatedPool = { ...state.subsidyPool };
        if (receiver.affordabilityTier === 'Low' && match.priceBreakdown.subsidyAmount > 0) {
          updatedPool = {
            ...updatedPool,
            balance: Math.round((updatedPool.balance - match.priceBreakdown.subsidyAmount) * 100) / 100,
            totalOut: Math.round((updatedPool.totalOut + match.priceBreakdown.subsidyAmount) * 100) / 100,
            transactions: [
              {
                id: `tx-${Date.now()}`,
                timestamp: state.simulatedClock,
                type: 'OUT' as const,
                amount: match.priceBreakdown.subsidyAmount,
                description: `Delivery fee subsidy applied for ${receiver.name} (${match.quantityAllocated} ${lot.unit})`,
                matchId: match.id,
              },
              ...updatedPool.transactions,
            ],
          };
        } else if (receiver.affordabilityTier === 'High' && match.priceBreakdown.subsidyAmount < 0) {
          const contribution = Math.abs(match.priceBreakdown.subsidyAmount);
          updatedPool = {
            ...updatedPool,
            balance: Math.round((updatedPool.balance + contribution) * 100) / 100,
            totalIn: Math.round((updatedPool.totalIn + contribution) * 100) / 100,
            transactions: [
              {
                id: `tx-${Date.now()}`,
                timestamp: state.simulatedClock,
                type: 'IN' as const,
                amount: contribution,
                description: `25% Help Fund surcharge contribution from ${receiver.name}`,
                matchId: match.id,
              },
              ...updatedPool.transactions,
            ],
          };
        }

        const updatedMatches = state.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                status: 'In Transit' as const,
                deliveryPartnerId: assignedPartner?.id,
                currentRouteProgress: 5,
                currentCoordinates: assignedPartner?.currentLocation,
                timeline: [
                  ...m.timeline,
                  {
                    timestamp: state.simulatedClock,
                    event: 'Accepted & Dispatched',
                    description: `Receiver accepted proposal. Auto-assigned courier "${assignedPartner?.companyName}" (${assignedPartner?.vehicleType}). Driver: ${assignedPartner?.driverName}.`,
                  },
                ],
              }
            : m
        );

        const updatedRequests = state.requests.map((r) =>
          r.id === req.id ? { ...r, status: 'In Transit' as const } : r
        );

        const updatedPartners = state.deliveryPartners.map((p) =>
          p.id === assignedPartner?.id ? { ...p, status: 'Busy' as const } : p
        );

        set({
          matches: updatedMatches,
          requests: updatedRequests,
          deliveryPartners: updatedPartners,
          subsidyPool: updatedPool,
        });

        state.addToast('success', 'toasts.matchAccepted', 'Delivery partner assigned.');
        get().runSmartVsBaselineComparison();
        return { success: true };
      },

      declineMatch: (matchId, reason) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return;

        const lot = state.lots.find((l) => l.id === match.lotId);
        let updatedLots = state.lots;
        if (lot) {
          updatedLots = state.lots.map((l) =>
            l.id === lot.id
              ? {
                  ...l,
                  quantityRemaining: l.quantityRemaining + match.quantityAllocated,
                  status: 'Available' as const,
                }
              : l
          );
        }

        const updatedMatches = state.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                status: 'Declined' as const,
                declineReason: reason,
                timeline: [
                  ...m.timeline,
                  {
                    timestamp: state.simulatedClock,
                    event: 'Declined',
                    description: `Proposal declined. Reason: ${reason}. System re-evaluating next best provider.`,
                  },
                ],
              }
            : m
        );

        const updatedRequests = state.requests.map((r) =>
          r.id === match.requestId
            ? {
                ...r,
                quantityReceived: Math.max(0, (r.quantityReceived || 0) - match.quantityAllocated),
                status: 'Waiting' as const,
              }
            : r
        );

        const reMatchResult = runSmartMatching({
          lots: updatedLots,
          requests: updatedRequests,
          providers: state.providers,
          receivers: state.receivers,
          currentTime: state.simulatedClock,
          weights: state.matchingWeights,
          maxTravelDistanceKm: state.maxTravelDistanceKm,
          existingMatches: updatedMatches,
        });

        set({
          lots: reMatchResult.updatedLots,
          requests: reMatchResult.updatedRequests,
          matches: reMatchResult.matches,
        });

        state.addToast('warning', 'toasts.matchDeclined', 'Proposal declined.');
        get().runSmartVsBaselineComparison();
      },

      confirmDeliveryReceived: (matchId, deliveredQty) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return;

        const lot = state.lots.find((l) => l.id === match.lotId);
        const actualQty = deliveredQty ?? match.quantityAllocated;

        const updatedPartners = state.deliveryPartners.map((p) =>
          p.id === match.deliveryPartnerId ? { ...p, status: 'Available' as const } : p
        );

        const updatedMatches = state.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                status: 'Delivered' as const,
                currentRouteProgress: 100,
                timeline: [
                  ...m.timeline,
                  {
                    timestamp: state.simulatedClock,
                    event: 'Delivered',
                    description: `Delivery completed and verified. ${actualQty} ${lot?.unit || 'portions'} received safely.`,
                  },
                ],
              }
            : m
        );

        const updatedRequests = state.requests.map((r) => {
          if (r.id === match.requestId) {
            const isFullyReceived = (r.quantityReceived || 0) >= r.quantityNeeded;
            return {
              ...r,
              status: (isFullyReceived ? 'Delivered' : 'Partially Fulfilled') as any,
            };
          }
          return r;
        });

        set({
          matches: updatedMatches,
          requests: updatedRequests,
          deliveryPartners: updatedPartners,
        });

        state.addToast('success', 'toasts.deliveryConfirmed', 'Delivery verified!');
        get().runSmartVsBaselineComparison();
      },

      setMatchingWeights: (weights) => {
        const norm = normalizeWeights(weights);
        set({ matchingWeights: norm });

        const state = get();
        const result = runSmartMatching({
          lots: state.lots,
          requests: state.requests,
          providers: state.providers,
          receivers: state.receivers,
          currentTime: state.simulatedClock,
          weights: norm,
          maxTravelDistanceKm: state.maxTravelDistanceKm,
          existingMatches: state.matches.filter((m) => m.status !== 'Proposed'),
        });

        set({
          lots: result.updatedLots,
          requests: result.updatedRequests,
          matches: result.matches,
        });

        get().runSmartVsBaselineComparison();
      },

      setDeliverySpeedMultiplier: (speed) => set({ deliverySpeedMultiplier: speed }),

      toggleClockPlay: () => set((state) => ({ isClockPlaying: !state.isClockPlaying })),

      setClockSpeed: (speed) => set({ clockSpeed: speed }),

      tickSimulatedClock: (deltaSeconds) => {
        const state = get();
        if (!state.isClockPlaying) return;

        const currentMs = new Date(state.simulatedClock).getTime();
        const advancedMs = currentMs + deltaSeconds * 1000 * state.clockSpeed;
        const newClockIso = new Date(advancedMs).toISOString();

        // 1. Check for expired lots
        let lotExpired = false;
        const updatedLots = state.lots.map((lot) => {
          if (
            lot.status !== 'Expired' &&
            lot.status !== 'Wasted' &&
            new Date(lot.expiryAt).getTime() <= advancedMs
          ) {
            lotExpired = true;
            return {
              ...lot,
              status: 'Expired' as const,
              quantityWasted: lot.quantityRemaining,
              quantityRemaining: 0,
              wasteReason: 'expired' as const,
            };
          }
          return lot;
        });

        // 2. Animate delivery partners
        let partnersUpdated = false;
        const providerMap = new Map(state.providers.map((p) => [p.id, p]));
        const receiverMap = new Map(state.receivers.map((r) => [r.id, r]));
        const partnerMap = new Map(state.deliveryPartners.map((dp) => [dp.id, dp]));

        const updatedMatches = state.matches.map((m) => {
          if (m.status !== 'In Transit') return m;

          const lot = state.lots.find((l) => l.id === m.lotId);
          const req = state.requests.find((r) => r.id === m.requestId);
          const prov = lot ? providerMap.get(lot.providerId) : undefined;
          const rec = req ? receiverMap.get(req.receiverId) : undefined;

          if (!prov || !rec) return m;

          const speedFactor = (state.clockSpeed * state.deliverySpeedMultiplier) / 4;
          const currentProgress = m.currentRouteProgress || 5;
          const newProgress = Math.min(100, currentProgress + 1.2 * speedFactor);

          let lat = prov.location.lat;
          let lng = prov.location.lng;

          if (newProgress <= 40) {
            const partner = partnerMap.get(m.deliveryPartnerId || '');
            const startLat = partner?.currentLocation.lat || prov.location.lat;
            const startLng = partner?.currentLocation.lng || prov.location.lng;
            const t = newProgress / 40;
            lat = startLat + (prov.location.lat - startLat) * t;
            lng = startLng + (prov.location.lng - startLng) * t;
          } else {
            const t = (newProgress - 40) / 60;
            lat = prov.location.lat + (rec.location.lat - prov.location.lat) * t;
            lng = prov.location.lng + (rec.location.lng - prov.location.lng) * t;
          }

          partnersUpdated = true;

          return {
            ...m,
            currentRouteProgress: Math.round(newProgress * 10) / 10,
            currentCoordinates: { lat, lng },
          };
        });

        const updatedDeliveryPartners = state.deliveryPartners.map((p) => {
          const activeMatch = updatedMatches.find(
            (m) => m.deliveryPartnerId === p.id && m.status === 'In Transit'
          );
          if (activeMatch?.currentCoordinates) {
            return {
              ...p,
              currentLocation: activeMatch.currentCoordinates,
            };
          }
          return p;
        });

        set({
          simulatedClock: newClockIso,
          lots: updatedLots,
          matches: updatedMatches,
          deliveryPartners: partnersUpdated ? updatedDeliveryPartners : state.deliveryPartners,
        });

        if (lotExpired) {
          state.addToast('warning', 'common.expired', 'A food lot passed its use-before time.');
        }
      },

      runSmartVsBaselineComparison: () => {
        const state = get();
        const baselineResult = runBaselineMatching({
          lots: state.lots,
          requests: state.requests,
          providers: state.providers,
          receivers: state.receivers,
          currentTime: state.simulatedClock,
          maxTravelDistanceKm: state.maxTravelDistanceKm,
        });

        const comparison = calculateComparisonMetrics({
          smartMatches: state.matches,
          baselineResult,
          lots: state.lots,
          requests: state.requests,
          receivers: state.receivers,
        });

        set({ comparisonMetrics: comparison });
      },

      loadDemoScenario: () => {
        set({
          providers: SEED_PROVIDERS,
          receivers: SEED_RECEIVERS,
          lots: SEED_FOOD_LOTS,
          requests: SEED_REQUESTS,
          matches: [],
          deliveryPartners: SEED_DELIVERY_PARTNERS,
          subsidyPool: INITIAL_HELP_FUND,
          notifications: [],
          simulatedClock: BASE_SIMULATION_TIME,
          selectedProviderId: SEED_PROVIDERS[0].id,
          selectedReceiverId: SEED_RECEIVERS[0].id,
          maxTravelDistanceKm: DEFAULT_MAX_TRAVEL_DISTANCE_KM,
        });

        const matchResult = runSmartMatching({
          lots: SEED_FOOD_LOTS,
          requests: SEED_REQUESTS,
          providers: SEED_PROVIDERS,
          receivers: SEED_RECEIVERS,
          currentTime: BASE_SIMULATION_TIME,
          weights: DEFAULT_WEIGHTS,
          maxTravelDistanceKm: DEFAULT_MAX_TRAVEL_DISTANCE_KM,
        });

        set({
          lots: matchResult.updatedLots,
          requests: matchResult.updatedRequests,
          matches: matchResult.matches,
        });

        get().runSmartVsBaselineComparison();
      },

      quickSelectReceiver: (type) => {
        if (type === 'low-charge') {
          set({ selectedReceiverId: 'rec-1' }); // Anbu Illam Orphanage, Erode
        } else {
          set({ selectedReceiverId: 'rec-7' }); // Tech Park Dining, Coimbatore
        }
      },

      addRandomProvider: () => {
        const state = get();
        const names = [
          'Vasantha Bhavan, Salem',
          'Hotel Saravana Grand, Erode',
          'Aachi Mess, Madurai',
          'Kalyana Mandapam, Tiruppur',
          'Sree Annapoorna Express, Pollachi',
        ];
        const types: Provider['type'][] = ['Restaurant', 'Hotel', 'Supermarket', 'Caterer', 'Canteen', 'Wedding hall'];
        const name = names[Math.floor(Math.random() * names.length)] + ` #${Math.floor(Math.random() * 90 + 10)}`;
        const type = types[Math.floor(Math.random() * types.length)];
        const lat = 11.0 + Math.random() * 0.3;
        const lng = 76.9 + Math.random() * 0.4;

        const newProvider: Provider = {
          id: `prov-${Date.now()}`,
          name,
          type,
          ownerName: 'Muthuvel K',
          location: {
            lat: Math.round(lat * 10000) / 10000,
            lng: Math.round(lng * 10000) / 10000,
            address: `${Math.floor(Math.random() * 800 + 10)} Main Rd, Tamil Nadu`,
            district: 'Coimbatore',
          },
          district: 'Coimbatore',
          address: `${Math.floor(Math.random() * 800 + 10)} Main Rd, Tamil Nadu`,
          phone: `98422${Math.floor(Math.random() * 90000 + 10000)}`,
          email: `prov${Date.now()}@resqfood.in`,
          verificationStatus: 'Verified',
        };

        set({
          providers: [...state.providers, newProvider],
          selectedProviderId: newProvider.id,
        });

        get().addToast('success', 'Provider Added', `Added ${newProvider.name}.`);
      },

      addRandomReceiver: () => {
        const state = get();
        const orgTypes: Receiver['organizationType'][] = [
          'Orphanage',
          'Old Age Home',
          'NGO',
          'Community Kitchen',
          'Shelter',
          'Corporate Canteen',
        ];
        const orgType = orgTypes[Math.floor(Math.random() * orgTypes.length)];
        const tier = orgType === 'Corporate Canteen' ? 'High' : orgType === 'Shelter' ? 'Low' : 'Low';
        const lat = 11.0 + Math.random() * 0.3;
        const lng = 76.9 + Math.random() * 0.4;

        const newReceiver: Receiver = {
          id: `rec-${Date.now()}`,
          name: `${orgType} Community Center #${Math.floor(Math.random() * 90 + 10)}`,
          organizationType: orgType,
          headcount: Math.floor(Math.random() * 80 + 30),
          contactPerson: 'Senthil Nathan',
          affordabilityTier: tier,
          monthlyBudget: tier === 'High' ? 60000 : 4000,
          vulnerabilityScore: tier === 'Low' ? 0.92 : 0.2,
          location: {
            lat: Math.round(lat * 10000) / 10000,
            lng: Math.round(lng * 10000) / 10000,
            address: `${Math.floor(Math.random() * 800 + 10)} North St, Tamil Nadu`,
            district: 'Coimbatore',
          },
          district: 'Coimbatore',
          address: `${Math.floor(Math.random() * 800 + 10)} North St, Tamil Nadu`,
          phone: `94433${Math.floor(Math.random() * 90000 + 10000)}`,
          email: `rec${Date.now()}@resqfood.in`,
          verificationStatus: 'Verified',
        };

        set({
          receivers: [...state.receivers, newReceiver],
          selectedReceiverId: newReceiver.id,
        });

        get().addToast('success', 'Receiver Added', `Added ${newReceiver.name}.`);
      },

      addRandomRequest: () => {
        const state = get();
        const activeReceiver =
          state.receivers.find((r) => r.id === state.selectedReceiverId) || state.receivers[0];
        const urgencies: FoodRequest['urgency'][] = ['Low', 'Medium', 'High', 'Critical'];
        const prefs: FoodRequest['foodPreference'][] = ['Veg', 'Non-Veg', 'Any'];
        const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
        const pref = prefs[Math.floor(Math.random() * prefs.length)];
        const qty = Math.floor(Math.random() * 50 + 20);

        const current = new Date(state.simulatedClock);
        const neededBy = new Date(
          current.getTime() + (Math.floor(Math.random() * 3) + 2) * 3600 * 1000
        ).toISOString();

        state.createMultiFoodRequests([
          {
            receiverId: activeReceiver.id,
            foodPreference: pref,
            broadPreferences: ['Cooked meal', 'Tiffin'],
            quantityNeeded: qty,
            neededBy,
            urgency,
          },
        ]);
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, dismissed: true } : n
          ),
        }));
      },

      clearAllNotifications: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, dismissed: true })),
        }));
      },

      addToast: (type, title, message) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        set((state) => ({
          toasts: [...state.toasts.slice(-4), { id, type, title, message }],
        }));
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      resetDemoData: () => {
        localStorage.removeItem('resqfood_storage_tn');
        get().loadDemoScenario();
      },
    }),
    {
      name: 'resqfood_storage_tn',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        accounts: state.accounts,
        providers: state.providers,
        receivers: state.receivers,
        lots: state.lots,
        requests: state.requests,
        matches: state.matches,
        deliveryPartners: state.deliveryPartners,
        subsidyPool: state.subsidyPool,
        matchingWeights: state.matchingWeights,
        maxTravelDistanceKm: state.maxTravelDistanceKm,
        simulatedClock: state.simulatedClock,
        selectedProviderId: state.selectedProviderId,
        selectedReceiverId: state.selectedReceiverId,
        completedTours: state.completedTours,
      }),
    }
  )
);

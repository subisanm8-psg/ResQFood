export type FoodType = 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan' | 'Mixed';

export type FoodCategory =
  | 'Cooked meal'
  | 'Tiffin'
  | 'Snack'
  | 'Sweet'
  | 'Traditional'
  | 'Bakery'
  | 'Produce'
  | 'Packaged'
  | 'Dairy';

export type UnitType = 'portions' | 'kg';

export type ProviderType =
  | 'Restaurant'
  | 'Hotel'
  | 'Supermarket'
  | 'Caterer'
  | 'Canteen'
  | 'Wedding hall';

export type OrgType =
  | 'NGO'
  | 'Orphanage'
  | 'Old Age Home'
  | 'Community Kitchen'
  | 'School or Hostel'
  | 'Shelter'
  | 'Village Community'
  | 'Religious Community'
  | 'Corporate Canteen'
  | 'Event Organiser';

export type AffordabilityTier = 'Low' | 'Medium' | 'High';

export type UserVerificationStatus = 'Verified' | 'Waiting for approval' | 'Suspended';

export type UserRole = 'Admin' | 'Provider' | 'Receiver';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type FoodPreference = 'Veg' | 'Non-Veg' | 'Any';

export type LotStatus = 'Available' | 'Partially Matched' | 'Fully Matched' | 'Expired' | 'Wasted';

export type RequestStatus =
  | 'Waiting'
  | 'Matched'
  | 'Accepted'
  | 'In Transit'
  | 'Delivered'
  | 'Partially Fulfilled'
  | 'Unfulfilled';

export type MatchStatus =
  | 'Proposed'
  | 'Accepted'
  | 'Declined'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'Expired'
  | 'Cancelled';

export type VehicleType = 'Auto' | 'Cab' | 'Mini Van' | 'Large Van';

export type DeliveryStatus = 'Available' | 'Busy';

export type WasteReason = 'expired' | 'spoiled' | 'over-prepared';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  district?: string;
  placeName?: string;
}

export interface FoodLot {
  id: string;
  providerId: string;
  dishId?: string;
  itemName: string;
  foodType: FoodType;
  category: FoodCategory;
  quantityTotal: number;
  quantityRemaining: number;
  unit: UnitType;
  quantityWasted: number;
  wasteReason?: WasteReason;
  preparedAt: string; // ISO string
  expiryAt: string; // ISO string
  status: LotStatus;
  specialNotes?: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  ownerName?: string;
  location: Location;
  phone?: string;
  email?: string;
  district?: string;
  address?: string;
  fssaiNumber?: string;
  verificationStatus?: UserVerificationStatus;
}

export interface Receiver {
  id: string;
  name: string;
  organizationType: OrgType;
  headcount: number;
  contactPerson?: string;
  location: Location;
  phone?: string;
  email?: string;
  district?: string;
  address?: string;
  affordabilityTier: AffordabilityTier;
  monthlyBudget: number;
  vulnerabilityScore: number; // 0 to 1
  verificationStatus?: UserVerificationStatus;
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  entityId: string; // references providerId, receiverId, or adminId
  displayName: string;
  verificationStatus: UserVerificationStatus;
  failedLoginAttempts: number;
  lockedUntil?: number;
  createdAt: string;
}

export interface FoodRequest {
  id: string;
  receiverId: string;
  foodPreference: FoodPreference;
  broadPreferences: FoodCategory[];
  quantityNeeded: number;
  quantityReceived: number;
  neededBy: string; // ISO string
  urgency: UrgencyLevel;
  status: RequestStatus;
  createdAt: string; // ISO string
  unfulfilledReason?: string;
}

export interface ScoreBreakdown {
  expiryPressure: number;
  distanceNormalized: number;
  quantityFit: number;
  wWaste: number;
  wDist: number;
  wDemand: number;
  calculatedScore: number;
  details?: {
    timeUntilExpiryHours: number;
    distanceKm: number;
    allocatedRatio: number;
  };
}

export interface PriceBreakdown {
  foodHandlingFee: number;
  deliveryCost: number;
  basePrice: number;
  subsidyRate: number; // e.g. -0.90 for Low (-90%), +0.25 for High (+25%), 0 for Medium
  subsidyAmount: number; // positive = funded by Help Fund, negative = contribution to Help Fund
  finalAmount: number; // amount paid by receiver
  tier: AffordabilityTier;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  description: string;
}

export type DeliveryProgressStatus =
  | 'Partner assigned'
  | 'Heading to pickup'
  | 'Picked up'
  | 'On the way'
  | 'Delivered';

export interface DeliveryState {
  matchId: string;
  status: DeliveryProgressStatus;
  progress: number; // 0 to 1
  routePoints: [number, number][] ;
  startedAt: string;
  etaMinutes: number;
  timeline: { timestamp: string; event: string; description: string }[];
}

export interface Match {
  id: string;
  requestId: string;
  lotId: string;
  quantityAllocated: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  distanceKm: number;
  etaMinutes: number;
  status: MatchStatus;
  timeline: TimelineEvent[];
  priceBreakdown: PriceBreakdown;
  deliveryPartnerId?: string;
  declineReason?: string;
  currentRouteProgress?: number; // 0 to 100% or 0 to 1
  currentCoordinates?: { lat: number; lng: number };
  delivery?: DeliveryState;
  createdAt: string;
}

export interface DeliveryPartner {
  id: string;
  companyName: string;
  vehicleType: VehicleType;
  capacity: number;
  currentLocation: { lat: number; lng: number };
  status: DeliveryStatus;
  ratePerKm: number;
  plateNumber: string;
  driverName: string;
  phone?: string;
}

export type NotificationType =
  | 'MatchProposed'
  | 'MatchAccepted'
  | 'MatchDeclined'
  | 'Dispatched'
  | 'Delivered'
  | 'Expired'
  | 'Warning'
  | 'SubsidyBlocked';

export interface Notification {
  id: string;
  toRole: 'Provider' | 'Receiver' | 'All';
  toId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, any>;
  createdAt: string;
  dismissed: boolean;
}

export interface SubsidyPool {
  balance: number;
  currentBalance?: number;
  totalIn: number;
  totalOut: number;
  transactions: {
    id: string;
    timestamp: string;
    type: 'IN' | 'OUT';
    amount: number;
    description: string;
    matchId?: string;
  }[];
}

export interface MatchingWeights {
  wWaste: number; // default 0.4
  wDist: number; // default 0.3
  wDemand: number; // default 0.3
}

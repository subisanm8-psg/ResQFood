import { AffordabilityTier, PriceBreakdown, VehicleType } from '../types';

export interface PricingParams {
  allocatedQuantity: number;
  unit: 'portions' | 'kg';
  distanceKm: number;
  ratePerKm?: number;
  vehicleType?: VehicleType;
  tier: AffordabilityTier;
}

export const VEHICLE_MINIMUM_FEES: Record<VehicleType, number> = {
  Auto: 80,
  Cab: 100,
  'Mini Van': 150,
  'Large Van': 250,
};

export const VEHICLE_RATES_PER_KM: Record<VehicleType, number> = {
  Auto: 12,
  Cab: 14,
  'Mini Van': 18,
  'Large Van': 25,
};

export const HANDLING_RATES = {
  portions: 2, // Rs. 2 per portion
  kg: 10, // Rs. 10 per kg
};

/**
 * Calculates complete transparent price breakdown according to receiver affordability tier.
 * All values are in whole rupees, rounded with Math.round.
 */
export function calculatePriceBreakdown(params: PricingParams): PriceBreakdown {
  const {
    allocatedQuantity,
    unit,
    distanceKm,
    vehicleType = 'Mini Van',
    tier,
  } = params;

  // 1. Food handling fee: Rs. 2 per portion, or Rs. 10 per kg
  const unitRate = HANDLING_RATES[unit] ?? 2;
  const foodHandlingFee = Math.round(allocatedQuantity * unitRate);

  // 2. Delivery cost = max(vehicle minimum, distanceKm x ratePerKm)
  const minVehicleFee = VEHICLE_MINIMUM_FEES[vehicleType] ?? 150;
  const ratePerKm = params.ratePerKm ?? VEHICLE_RATES_PER_KM[vehicleType] ?? 18;
  const rawDeliveryCost = distanceKm * ratePerKm;
  const deliveryCost = Math.round(Math.max(minVehicleFee, rawDeliveryCost));

  // 3. Base price = foodHandlingFee + deliveryCost
  const basePrice = Math.round(foodHandlingFee + deliveryCost);

  let subsidyRate = 0;
  let subsidyAmount = 0; // Positive = Help Fund applied / subsidized
  let finalAmount = basePrice;

  if (tier === 'Low') {
    // Low tier ("Very little"): receiver pays min(10 percent of basePrice, Rs. 50).
    // helpFundApplied = basePrice minus amount paid.
    const nominal = Math.min(Math.round(basePrice * 0.10), 50);
    finalAmount = nominal;
    subsidyAmount = Math.round(basePrice - finalAmount);
    subsidyRate = basePrice > 0 ? (subsidyAmount / basePrice) : 0;
  } else if (tier === 'High') {
    // High tier ("Full price"): receiver pays basePrice plus 25 percent of basePrice as a contribution.
    // helpFundContribution = 25 percent of basePrice.
    const helpFundContribution = Math.round(basePrice * 0.25);
    finalAmount = Math.round(basePrice + helpFundContribution);
    subsidyAmount = helpFundContribution; // Representing contribution amount
    subsidyRate = 0.25;
  } else {
    // Medium tier ("Some"): receiver pays basePrice. No Help Fund change.
    subsidyRate = 0;
    subsidyAmount = 0;
    finalAmount = basePrice;
  }

  return {
    foodHandlingFee,
    deliveryCost,
    basePrice,
    subsidyRate,
    subsidyAmount,
    finalAmount,
    tier,
  };
}

/**
 * Checks if current Help Fund balance can fund the required subsidy
 */
export function hasSufficientSubsidy(
  poolBalance: number,
  requiredSubsidyAmount: number
): { sufficient: boolean; deficit: number } {
  if (requiredSubsidyAmount <= 0) {
    return { sufficient: true, deficit: 0 };
  }
  const sufficient = poolBalance >= requiredSubsidyAmount;
  const deficit = sufficient ? 0 : Math.round(requiredSubsidyAmount - poolBalance);
  return { sufficient, deficit };
}

export interface HelpFundEntry {
  id: string;
  matchId?: string;
  type: 'Contribution' | 'Subsidy' | 'Reversal';
  amount: number;
  createdAt: string;
}

/**
 * Calculates live Help Fund balance from ledger array:
 * Sum of Contributions minus Sum of Subsidies plus Reversals.
 * Never stores balance as a separate number.
 */
export function calculateHelpFundBalance(ledger: HelpFundEntry[]): number {
  if (!ledger || !Array.isArray(ledger)) return 0;
  return ledger.reduce((balance, entry) => {
    if (entry.type === 'Contribution') {
      return balance + entry.amount;
    } else if (entry.type === 'Subsidy') {
      return balance - entry.amount;
    } else if (entry.type === 'Reversal') {
      return balance + entry.amount;
    }
    return balance;
  }, 0);
}

export function calculateHelpFundTotals(ledger: HelpFundEntry[]): {
  totalIn: number;
  totalOut: number;
  balance: number;
} {
  if (!ledger || !Array.isArray(ledger)) return { totalIn: 0, totalOut: 0, balance: 0 };
  let totalIn = 0;
  let totalOut = 0;
  ledger.forEach((entry) => {
    if (entry.type === 'Contribution' || entry.type === 'Reversal') {
      totalIn += entry.amount;
    } else if (entry.type === 'Subsidy') {
      totalOut += entry.amount;
    }
  });
  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
}

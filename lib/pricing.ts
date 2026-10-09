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
  Auto: 4.0,
  Cab: 7.0,
  'Mini Van': 12.0,
  'Large Van': 20.0,
};

export const HANDLING_RATES = {
  portions: 0.35, // $0.35 per portion
  kg: 0.5, // $0.50 per kg
};

/**
 * Calculates complete transparent price breakdown according to receiver affordability tier
 */
export function calculatePriceBreakdown(params: PricingParams): PriceBreakdown {
  const {
    allocatedQuantity,
    unit,
    distanceKm,
    ratePerKm = 1.25,
    vehicleType = 'Mini Van',
    tier,
  } = params;

  // 1. Food handling fee
  const unitRate = HANDLING_RATES[unit] || 0.4;
  const foodHandlingFee = Math.round(allocatedQuantity * unitRate * 100) / 100;

  // 2. Delivery cost with vehicle minimum
  const minVehicleFee = VEHICLE_MINIMUM_FEES[vehicleType] || 6.0;
  const rawDeliveryCost = distanceKm * ratePerKm;
  const deliveryCost = Math.round(Math.max(minVehicleFee, rawDeliveryCost) * 100) / 100;

  // 3. Base price
  const basePrice = Math.round((foodHandlingFee + deliveryCost) * 100) / 100;

  let subsidyRate = 0;
  let subsidyAmount = 0; // Positive = subsidized FROM pool, Negative = contribution TO pool
  let finalAmount = basePrice;

  if (tier === 'Low') {
    // Low tier pays nominal 10% of base price, capped at $6.00
    const nominal = Math.min(6.0, Math.round(basePrice * 0.1 * 100) / 100);
    finalAmount = Math.max(1.0, nominal); // minimum $1.00 nominal token fee
    subsidyAmount = Math.round((basePrice - finalAmount) * 100) / 100;
    subsidyRate = -Math.round(((basePrice - finalAmount) / basePrice) * 100) / 100;
  } else if (tier === 'High') {
    // High tier pays base price + 25% subsidy contribution into the pool
    const surcharge = Math.round(basePrice * 0.25 * 100) / 100;
    finalAmount = Math.round((basePrice + surcharge) * 100) / 100;
    subsidyAmount = -surcharge; // Negative means contribution to pool
    subsidyRate = 0.25;
  } else {
    // Medium tier pays standard base price
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
 * Checks if current subsidy pool can fund the required subsidy
 */
export function hasSufficientSubsidy(
  poolBalance: number,
  requiredSubsidyAmount: number
): { sufficient: boolean; deficit: number } {
  if (requiredSubsidyAmount <= 0) {
    return { sufficient: true, deficit: 0 };
  }
  const sufficient = poolBalance >= requiredSubsidyAmount;
  const deficit = sufficient ? 0 : Math.round((requiredSubsidyAmount - poolBalance) * 100) / 100;
  return { sufficient, deficit };
}

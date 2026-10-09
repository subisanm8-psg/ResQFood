import { describe, it, expect } from 'vitest';
import { calculatePriceBreakdown, hasSufficientSubsidy, VEHICLE_MINIMUM_FEES } from '../pricing';

describe('Pricing and Affordability Tier Unit Tests', () => {
  describe('5. Low vs High Tier Pricing and Subsidy Pool', () => {
    it('applies nominal 10% capped fee with subsidy for Low tier receiver', () => {
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 40,
        unit: 'portions',
        distanceKm: 8,
        vehicleType: 'Mini Van',
        tier: 'Low',
      });

      // Handling: 40 * 0.35 = 14.00
      // Delivery: max(12.00, 8 * 1.25 = 10.00) = 12.00
      // Base: 14 + 12 = 26.00
      expect(breakdown.basePrice).toBe(26.0);
      expect(breakdown.finalAmount).toBeLessThanOrEqual(6.0); // capped at $6
      expect(breakdown.subsidyAmount).toBeGreaterThan(0); // covered by subsidy pool
      expect(breakdown.finalAmount + breakdown.subsidyAmount).toBeCloseTo(breakdown.basePrice, 1);
    });

    it('adds 25% subsidy contribution surcharge for High tier corporate receiver', () => {
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 50,
        unit: 'portions',
        distanceKm: 10,
        vehicleType: 'Cab',
        tier: 'High',
      });

      // Handling: 50 * 0.35 = 17.50
      // Delivery: max(7.00, 10 * 1.25 = 12.50) = 12.50
      // Base: 17.50 + 12.50 = 30.00
      expect(breakdown.basePrice).toBe(30.0);
      // High tier pays base + 25% (30 + 7.50 = 37.50)
      expect(breakdown.finalAmount).toBe(37.5);
      // subsidyAmount is negative representing pool contribution
      expect(breakdown.subsidyAmount).toBe(-7.5);
    });

    it('charges standard base price with 0 subsidy for Medium tier receiver', () => {
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 20,
        unit: 'portions',
        distanceKm: 4,
        vehicleType: 'Auto',
        tier: 'Medium',
      });

      expect(breakdown.finalAmount).toBe(breakdown.basePrice);
      expect(breakdown.subsidyAmount).toBe(0);
    });

    it('enforces vehicle minimum fee when distance cost is lower', () => {
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 10,
        unit: 'portions',
        distanceKm: 1, // 1 km * $1.25 = $1.25, which is lower than Large Van minimum ($20)
        vehicleType: 'Large Van',
        tier: 'Medium',
      });

      expect(breakdown.deliveryCost).toBe(VEHICLE_MINIMUM_FEES['Large Van']);
    });

    it('correctly validates subsidy pool balance and reports deficit', () => {
      const poolBalance = 15.0;

      // Small subsidy need: $12
      const checkPass = hasSufficientSubsidy(poolBalance, 12.0);
      expect(checkPass.sufficient).toBe(true);
      expect(checkPass.deficit).toBe(0);

      // Large subsidy need: $28
      const checkFail = hasSufficientSubsidy(poolBalance, 28.0);
      expect(checkFail.sufficient).toBe(false);
      expect(checkFail.deficit).toBe(13.0);
    });
  });
});

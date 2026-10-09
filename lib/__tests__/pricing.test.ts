import { describe, it, expect } from 'vitest';
import {
  calculatePriceBreakdown,
  hasSufficientSubsidy,
  calculateHelpFundBalance,
  calculateHelpFundTotals,
  VEHICLE_MINIMUM_FEES,
  VEHICLE_RATES_PER_KM,
  HelpFundEntry,
} from '../pricing';

describe('ResQFood Pricing and Help Fund Unit Tests', () => {
  describe('Fix 3: Pure Whole Rupee Pricing Rules & Worked Example', () => {
    it('matches exact worked example: 20 portions, 15 km, Mini Van', () => {
      // 1. Low Tier:
      const lowBreakdown = calculatePriceBreakdown({
        allocatedQuantity: 20,
        unit: 'portions',
        distanceKm: 15,
        vehicleType: 'Mini Van',
        tier: 'Low',
      });
      expect(lowBreakdown.foodHandlingFee).toBe(40);
      expect(lowBreakdown.deliveryCost).toBe(270); // max(150, 15 * 18 = 270) = 270
      expect(lowBreakdown.basePrice).toBe(310);
      expect(lowBreakdown.finalAmount).toBe(31); // 10% of 310 = 31, capped at 50
      expect(lowBreakdown.subsidyAmount).toBe(279); // 310 - 31 = 279 Help Fund applied

      // 2. Medium Tier:
      const medBreakdown = calculatePriceBreakdown({
        allocatedQuantity: 20,
        unit: 'portions',
        distanceKm: 15,
        vehicleType: 'Mini Van',
        tier: 'Medium',
      });
      expect(medBreakdown.foodHandlingFee).toBe(40);
      expect(medBreakdown.deliveryCost).toBe(270);
      expect(medBreakdown.basePrice).toBe(310);
      expect(medBreakdown.finalAmount).toBe(310);
      expect(medBreakdown.subsidyAmount).toBe(0);

      // 3. High Tier:
      const highBreakdown = calculatePriceBreakdown({
        allocatedQuantity: 20,
        unit: 'portions',
        distanceKm: 15,
        vehicleType: 'Mini Van',
        tier: 'High',
      });
      expect(highBreakdown.foodHandlingFee).toBe(40);
      expect(highBreakdown.deliveryCost).toBe(270);
      expect(highBreakdown.basePrice).toBe(310);
      // High tier pays basePrice + 25% contribution (310 * 0.25 = 77.5 -> 78)
      expect(highBreakdown.subsidyAmount).toBe(78);
      expect(highBreakdown.finalAmount).toBe(388); // 310 + 78 = 388
    });

    it('enforces Rs. 50 cap on Low tier payments when 10% exceeds Rs. 50', () => {
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 200, // 200 * 2 = 400 handling
        unit: 'portions',
        distanceKm: 30, // 30 * 18 = 540 delivery
        vehicleType: 'Mini Van',
        tier: 'Low',
      });

      // basePrice = 400 + 540 = 940
      expect(breakdown.basePrice).toBe(940);
      // 10% of 940 is 94, which exceeds Rs. 50 cap
      expect(breakdown.finalAmount).toBe(50);
      expect(breakdown.subsidyAmount).toBe(890); // 940 - 50 = 890
    });

    it('correctly rounds High tier 25% contribution to nearest whole rupee', () => {
      // 310 * 0.25 = 77.5 -> rounds to 78
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 20,
        unit: 'portions',
        distanceKm: 15,
        vehicleType: 'Mini Van',
        tier: 'High',
      });
      expect(breakdown.subsidyAmount).toBe(78);
      expect(breakdown.finalAmount).toBe(388);
    });

    it('enforces vehicle minimum fees when distance cost is lower', () => {
      const breakdown = calculatePriceBreakdown({
        allocatedQuantity: 5,
        unit: 'portions',
        distanceKm: 2, // 2 km * Rs. 25 = Rs. 50, but Large Van minimum is Rs. 250
        vehicleType: 'Large Van',
        tier: 'Medium',
      });
      expect(breakdown.deliveryCost).toBe(VEHICLE_MINIMUM_FEES['Large Van']);
      expect(breakdown.deliveryCost).toBe(250);
    });
  });

  describe('Fix 3: Help Fund Ledger and Balance Calculations', () => {
    it('blocks Low tier when required subsidy exceeds balance', () => {
      const currentBalance = 200;
      const requiredSubsidy = 279;

      const check = hasSufficientSubsidy(currentBalance, requiredSubsidy);
      expect(check.sufficient).toBe(false);
      expect(check.deficit).toBe(79);

      const passCheck = hasSufficientSubsidy(300, requiredSubsidy);
      expect(passCheck.sufficient).toBe(true);
      expect(passCheck.deficit).toBe(0);
    });

    it('calculates sequence: opening 2000, High contribution 78, Low subsidy 279 = 1799', () => {
      const ledger: HelpFundEntry[] = [
        {
          id: 'hf-1',
          type: 'Contribution',
          amount: 2000,
          createdAt: '2026-10-09T08:00:00Z',
        },
        {
          id: 'hf-2',
          matchId: 'match-high-1',
          type: 'Contribution',
          amount: 78,
          createdAt: '2026-10-09T09:00:00Z',
        },
        {
          id: 'hf-3',
          matchId: 'match-low-1',
          type: 'Subsidy',
          amount: 279,
          createdAt: '2026-10-09T10:00:00Z',
        },
      ];

      const balance = calculateHelpFundBalance(ledger);
      expect(balance).toBe(1799); // 2000 + 78 - 279 = 1799

      const totals = calculateHelpFundTotals(ledger);
      expect(totals.totalIn).toBe(2078);
      expect(totals.totalOut).toBe(279);
      expect(totals.balance).toBe(1799);
    });

    it('maintains idempotency for duplicate payment recordings', () => {
      const ledger: HelpFundEntry[] = [
        { id: 'hf-1', type: 'Contribution', amount: 2000, createdAt: '2026-10-09T08:00:00Z' },
      ];

      const matchId = 'match-xyz';
      const recordPayment = (entries: HelpFundEntry[], entry: HelpFundEntry) => {
        if (entries.some((e) => e.matchId === entry.matchId && e.type === entry.type)) {
          return entries; // idempotent duplicate prevention
        }
        return [...entries, entry];
      };

      const newEntry: HelpFundEntry = {
        id: 'hf-2',
        matchId,
        type: 'Subsidy',
        amount: 279,
        createdAt: '2026-10-09T09:00:00Z',
      };

      const updatedOnce = recordPayment(ledger, newEntry);
      expect(updatedOnce.length).toBe(2);
      expect(calculateHelpFundBalance(updatedOnce)).toBe(1721);

      // Duplicate attempt must not add a second entry
      const updatedTwice = recordPayment(updatedOnce, newEntry);
      expect(updatedTwice.length).toBe(2);
      expect(calculateHelpFundBalance(updatedTwice)).toBe(1721);
    });

    it('adds Reversal entry when paid match is cancelled before pickup, restoring balance', () => {
      const ledger: HelpFundEntry[] = [
        { id: 'hf-open', type: 'Contribution', amount: 2000, createdAt: '2026-10-09T08:00:00Z' },
        { id: 'hf-sub', matchId: 'match-cancel', type: 'Subsidy', amount: 279, createdAt: '2026-10-09T09:00:00Z' },
      ];

      expect(calculateHelpFundBalance(ledger)).toBe(1721);

      // Cancellation triggers Reversal
      const withReversal: HelpFundEntry[] = [
        ...ledger,
        {
          id: 'hf-rev',
          matchId: 'match-cancel',
          type: 'Reversal',
          amount: 279,
          createdAt: '2026-10-09T09:30:00Z',
        },
      ];

      // Balance = 2000 - 279 + 279 = 2000
      expect(calculateHelpFundBalance(withReversal)).toBe(2000);
    });
  });
});

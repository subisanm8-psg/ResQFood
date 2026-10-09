import { describe, it, expect } from 'vitest';
import {
  isFoodTypeCompatible,
  checkHardConstraints,
  calculateRequestPriority,
  runSmartMatching,
  calculateMatchScore,
} from '../matcher';
import { Provider, Receiver, FoodLot, FoodRequest } from '../../types';

describe('Smart Matching Algorithm Unit Tests', () => {
  const mockProvider: Provider = {
    id: 'prov-1',
    name: 'Bistro Green',
    type: 'Restaurant',
    location: { lat: 37.7749, lng: -122.4194, address: 'Market St, San Francisco' },
  };

  const mockReceiver: Receiver = {
    id: 'rec-1',
    name: 'St. Jude Children Shelter',
    location: { lat: 37.7833, lng: -122.4167, address: 'Mission St, San Francisco' }, // ~1 km away
    organizationType: 'Shelter',
    headcount: 45,
    affordabilityTier: 'Low',
    monthlyBudget: 300,
    vulnerabilityScore: 0.95,
  };

  const baseTime = new Date('2026-10-09T12:00:00Z');

  describe('1. Veg / Non-Veg Compatibility', () => {
    it('strictly forbids Non-Veg or Mixed lots for a Veg request', () => {
      expect(isFoodTypeCompatible('Veg', 'Veg')).toBe(true);
      expect(isFoodTypeCompatible('Veg', 'Vegan')).toBe(true);
      expect(isFoodTypeCompatible('Veg', 'Non-Veg')).toBe(false);
      expect(isFoodTypeCompatible('Veg', 'Mixed')).toBe(false);
    });

    it('allows Non-Veg and Any preference to accept available food types', () => {
      expect(isFoodTypeCompatible('Non-Veg', 'Veg')).toBe(true);
      expect(isFoodTypeCompatible('Non-Veg', 'Non-Veg')).toBe(true);
      expect(isFoodTypeCompatible('Any', 'Mixed')).toBe(true);
      expect(isFoodTypeCompatible('Any', 'Vegan')).toBe(true);
    });
  });

  describe('2. Expiry vs ETA Feasibility', () => {
    it('accepts lot when delivery ETA + 20min buffer arrives safely before expiry', () => {
      const validLot: FoodLot = {
        id: 'lot-1',
        providerId: 'prov-1',
        itemName: 'Steamed Rice & Lentils',
        foodType: 'Veg',
        category: 'Cooked meal',
        quantityTotal: 50,
        quantityRemaining: 50,
        unit: 'portions',
        quantityWasted: 0,
        preparedAt: new Date(baseTime.getTime() - 2 * 3600 * 1000).toISOString(),
        expiryAt: new Date(baseTime.getTime() + 3 * 3600 * 1000).toISOString(), // 3 hours in future
        status: 'Available',
      };

      const request: FoodRequest = {
        id: 'req-1',
        receiverId: 'rec-1',
        foodPreference: 'Veg',
        broadPreferences: ['Cooked meal'],
        quantityNeeded: 30,
        quantityReceived: 0,
        neededBy: new Date(baseTime.getTime() + 2 * 3600 * 1000).toISOString(), // 2 hours
        urgency: 'High',
        status: 'Waiting',
        createdAt: baseTime.toISOString(),
      };

      const check = checkHardConstraints(validLot, request, mockProvider, mockReceiver, baseTime);
      expect(check.feasible).toBe(true);
      expect(check.distanceKm).toBeGreaterThan(0);
    });

    it('rejects lot when travel ETA + buffer exceeds lot expiry time', () => {
      const expiringLot: FoodLot = {
        id: 'lot-expired-soon',
        providerId: 'prov-1',
        itemName: 'Fresh Salad',
        foodType: 'Veg',
        category: 'Produce',
        quantityTotal: 20,
        quantityRemaining: 20,
        unit: 'portions',
        quantityWasted: 0,
        preparedAt: new Date(baseTime.getTime() - 4 * 3600 * 1000).toISOString(),
        expiryAt: new Date(baseTime.getTime() + 10 * 60 * 1000).toISOString(), // expires in only 10 mins! buffer is 20m + travel
        status: 'Available',
      };

      const request: FoodRequest = {
        id: 'req-1',
        receiverId: 'rec-1',
        foodPreference: 'Veg',
        broadPreferences: ['Produce'],
        quantityNeeded: 10,
        quantityReceived: 0,
        neededBy: new Date(baseTime.getTime() + 2 * 3600 * 1000).toISOString(),
        urgency: 'Medium',
        status: 'Waiting',
        createdAt: baseTime.toISOString(),
      };

      const check = checkHardConstraints(expiringLot, request, mockProvider, mockReceiver, baseTime);
      expect(check.feasible).toBe(false);
      expect(check.reason).toContain('Expiry safety buffer failed');
    });
  });

  describe('3. Request Priority Ordering', () => {
    it('prioritizes Critical urgency and high vulnerability over Low urgency and low vulnerability', () => {
      const criticalReq: FoodRequest = {
        id: 'req-crit',
        receiverId: 'rec-1',
        foodPreference: 'Any',
        broadPreferences: ['Cooked meal'],
        quantityNeeded: 40,
        quantityReceived: 0,
        neededBy: new Date(baseTime.getTime() + 2 * 3600 * 1000).toISOString(),
        urgency: 'Critical',
        status: 'Waiting',
        createdAt: baseTime.toISOString(),
      };

      const corporateReceiver: Receiver = {
        id: 'rec-corp',
        name: 'Corporate Dining',
        location: { lat: 37.77, lng: -122.42, address: 'Finance Way' },
        organizationType: 'Corporate Canteen',
        headcount: 100,
        affordabilityTier: 'High',
        monthlyBudget: 5000,
        vulnerabilityScore: 0.1,
      };

      const lowUrgencyReq: FoodRequest = {
        id: 'req-low',
        receiverId: 'rec-corp',
        foodPreference: 'Any',
        broadPreferences: ['Cooked meal'],
        quantityNeeded: 40,
        quantityReceived: 0,
        neededBy: new Date(baseTime.getTime() + 8 * 3600 * 1000).toISOString(),
        urgency: 'Low',
        status: 'Waiting',
        createdAt: baseTime.toISOString(),
      };

      const prioCrit = calculateRequestPriority(criticalReq, mockReceiver, baseTime);
      const prioLow = calculateRequestPriority(lowUrgencyReq, corporateReceiver, baseTime);

      expect(prioCrit).toBeGreaterThan(prioLow);
      expect(prioCrit).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('4. Partial and Split Fulfillment', () => {
    it('splits fulfillment across multiple lots when single lot is smaller than demand', () => {
      const largeDemandRequest: FoodRequest = {
        id: 'req-large',
        receiverId: 'rec-1',
        foodPreference: 'Veg',
        broadPreferences: ['Cooked meal'],
        quantityNeeded: 70, // Needs 70
        quantityReceived: 0,
        neededBy: new Date(baseTime.getTime() + 4 * 3600 * 1000).toISOString(),
        urgency: 'Critical',
        status: 'Waiting',
        createdAt: baseTime.toISOString(),
      };

      const lotA: FoodLot = {
        id: 'lot-a',
        providerId: 'prov-1',
        itemName: 'Vegetable Curry',
        foodType: 'Veg',
        category: 'Cooked meal',
        quantityTotal: 40,
        quantityRemaining: 40, // Lot A only has 40
        unit: 'portions',
        quantityWasted: 0,
        preparedAt: baseTime.toISOString(),
        expiryAt: new Date(baseTime.getTime() + 5 * 3600 * 1000).toISOString(),
        status: 'Available',
      };

      const lotB: FoodLot = {
        id: 'lot-b',
        providerId: 'prov-1',
        itemName: 'Jeera Rice',
        foodType: 'Veg',
        category: 'Cooked meal',
        quantityTotal: 50,
        quantityRemaining: 50, // Lot B has 50
        unit: 'portions',
        quantityWasted: 0,
        preparedAt: baseTime.toISOString(),
        expiryAt: new Date(baseTime.getTime() + 6 * 3600 * 1000).toISOString(),
        status: 'Available',
      };

      const result = runSmartMatching({
        lots: [lotA, lotB],
        requests: [largeDemandRequest],
        providers: [mockProvider],
        receivers: [mockReceiver],
        currentTime: baseTime,
      });

      // Request needed 70: got 40 from Lot A and 30 from Lot B
      expect(result.matches.length).toBe(2);
      const totalAllocated = result.matches.reduce((sum, m) => sum + m.quantityAllocated, 0);
      expect(totalAllocated).toBe(70);

      const updatedReq = result.updatedRequests.find((r) => r.id === 'req-large');
      expect(updatedReq?.status).toBe('Matched');
      expect(updatedReq?.quantityReceived).toBe(70);

      // Lot B (50 portions) had higher quantityFit for demand 70 than Lot A (40 portions),
      // so Lot B was matched first (50 portions), then Lot A provided remaining 20 portions.
      const updatedLotA = result.updatedLots.find((l) => l.id === 'lot-a');
      const updatedLotB = result.updatedLots.find((l) => l.id === 'lot-b');
      expect(updatedLotB?.quantityRemaining).toBe(0);
      expect(updatedLotB?.status).toBe('Fully Matched');
      expect(updatedLotA?.quantityRemaining).toBe(20);
      expect(updatedLotA?.status).toBe('Partially Matched');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { getSpeedKmh, calculateEtaMinutes } from '../distance';
import { checkHardConstraints, runSmartMatching } from '../matcher';
import { Provider, Receiver, FoodLot, FoodRequest } from '../../types';

describe('Speed Rule and Max Travel Distance Unit Tests', () => {
  it('applies 25 km/h inside a city (under 8 km) and 40 km/h between towns (8 km and above)', () => {
    // Under 8 km: 25 km/h
    expect(getSpeedKmh(2)).toBe(25);
    expect(getSpeedKmh(7.9)).toBe(25);

    // 8 km and above: 40 km/h
    expect(getSpeedKmh(8.0)).toBe(40);
    expect(getSpeedKmh(25)).toBe(40);
    expect(getSpeedKmh(80)).toBe(40);

    // ETA calculations
    // 5 km at 25 km/h: (5 / 25) * 60 = 12 minutes
    expect(calculateEtaMinutes(5)).toBe(12);

    // 20 km at 40 km/h: (20 / 40) * 60 = 30 minutes
    expect(calculateEtaMinutes(20)).toBe(30);
  });

  it('rejects candidate matches beyond max travel distance with reason "Too far"', () => {
    const provider: Provider = {
      id: 'prov-coimbatore',
      name: 'Annapoorna Mess',
      type: 'Restaurant',
      ownerName: 'Ramasamy',
      location: { lat: 11.0168, lng: 76.9558, address: 'Coimbatore' },
      district: 'Coimbatore',
      address: 'Coimbatore',
      phone: '9842211001',
      email: 'p@test.com',
      verificationStatus: 'Verified',
    };

    // Far away receiver in Madurai (~170 km away)
    const farReceiver: Receiver = {
      id: 'rec-madurai',
      name: 'Madurai Shelter',
      organizationType: 'Shelter',
      headcount: 50,
      contactPerson: 'Muthu',
      location: { lat: 9.9252, lng: 78.1198, address: 'Madurai' },
      district: 'Madurai',
      address: 'Madurai',
      phone: '9842211002',
      email: 'r@test.com',
      affordabilityTier: 'Low',
      monthlyBudget: 2000,
      vulnerabilityScore: 0.9,
      verificationStatus: 'Verified',
    };

    const lot: FoodLot = {
      id: 'lot-1',
      providerId: 'prov-coimbatore',
      itemName: 'Ven Pongal',
      foodType: 'Veg',
      category: 'Tiffin',
      quantityTotal: 40,
      quantityRemaining: 40,
      unit: 'portions',
      quantityWasted: 0,
      preparedAt: '2026-10-09T10:00:00.000Z',
      expiryAt: '2026-10-09T18:00:00.000Z',
      status: 'Available',
    };

    const request: FoodRequest = {
      id: 'req-1',
      receiverId: 'rec-madurai',
      foodPreference: 'Veg',
      broadPreferences: ['Tiffin'],
      quantityNeeded: 30,
      quantityReceived: 0,
      neededBy: '2026-10-09T17:00:00.000Z',
      urgency: 'High',
      status: 'Waiting',
      createdAt: '2026-10-09T11:00:00.000Z',
    };

    // Test with default max distance 60 km
    const check = checkHardConstraints(lot, request, provider, farReceiver, '2026-10-09T12:00:00.000Z', 60);
    expect(check.feasible).toBe(false);
    expect(check.reason).toBe('Too far');
    expect(check.distanceKm).toBeGreaterThan(60);

    // Test smart matcher marks unfulfilled with reason "Too far"
    const matchResult = runSmartMatching({
      lots: [lot],
      requests: [request],
      providers: [provider],
      receivers: [farReceiver],
      currentTime: '2026-10-09T12:00:00.000Z',
      maxTravelDistanceKm: 60,
    });

    expect(matchResult.matches.length).toBe(0);
    const unfulfilled = matchResult.updatedRequests.find((r) => r.id === 'req-1');
    expect(unfulfilled?.status).toBe('Unfulfilled');
    expect(unfulfilled?.unfulfilledReason).toBe('Too far');
  });
});

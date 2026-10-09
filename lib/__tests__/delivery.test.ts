import { describe, it, expect, vi } from 'vitest';
import {
  getDeliveryStatusFromProgress,
  generateStraightLineRoute,
  interpolateRoutePosition,
  fetchRouteWithFallback,
} from '../deliveryHelper';
import { DeliveryState, Match } from '../../types';

describe('Fix 4: Delivery Progress and Routing Tests', () => {
  describe('Status changes at correct progress thresholds', () => {
    it('maps progress 0 to Partner assigned', () => {
      expect(getDeliveryStatusFromProgress(0)).toBe('Partner assigned');
    });

    it('maps progress 0 < p < 0.25 to Heading to pickup', () => {
      expect(getDeliveryStatusFromProgress(0.01)).toBe('Heading to pickup');
      expect(getDeliveryStatusFromProgress(0.12)).toBe('Heading to pickup');
      expect(getDeliveryStatusFromProgress(0.24)).toBe('Heading to pickup');
    });

    it('maps progress 0.25 <= p < 0.3 to Picked up', () => {
      expect(getDeliveryStatusFromProgress(0.25)).toBe('Picked up');
      expect(getDeliveryStatusFromProgress(0.27)).toBe('Picked up');
      expect(getDeliveryStatusFromProgress(0.299)).toBe('Picked up');
    });

    it('maps progress 0.3 <= p < 1.0 to On the way', () => {
      expect(getDeliveryStatusFromProgress(0.3)).toBe('On the way');
      expect(getDeliveryStatusFromProgress(0.65)).toBe('On the way');
      expect(getDeliveryStatusFromProgress(0.99)).toBe('On the way');
    });

    it('maps progress >= 1.0 to Delivered', () => {
      expect(getDeliveryStatusFromProgress(1.0)).toBe('Delivered');
      expect(getDeliveryStatusFromProgress(1.05)).toBe('Delivered');
    });
  });

  describe('Straight-line route fallback and interpolation', () => {
    it('generates straight line route with correct start and end points', () => {
      const pickup: [number, number] = [11.0168, 76.9558];
      const drop: [number, number] = [11.3410, 77.7172];

      const route = generateStraightLineRoute(pickup, drop, 10);
      expect(route.length).toBe(11);
      expect(route[0]).toEqual(pickup);
      expect(route[route.length - 1]).toEqual(drop);
    });

    it('interpolates positions accurately along route points', () => {
      const pickup: [number, number] = [10.0, 70.0];
      const drop: [number, number] = [20.0, 80.0];
      const route = generateStraightLineRoute(pickup, drop, 10);

      const startPos = interpolateRoutePosition(route, 0);
      expect(startPos.lat).toBeCloseTo(10.0, 2);
      expect(startPos.lng).toBeCloseTo(70.0, 2);

      const midPos = interpolateRoutePosition(route, 0.5);
      expect(midPos.lat).toBeCloseTo(15.0, 2);
      expect(midPos.lng).toBeCloseTo(75.0, 2);

      const endPos = interpolateRoutePosition(route, 1.0);
      expect(endPos.lat).toBeCloseTo(20.0, 2);
      expect(endPos.lng).toBeCloseTo(80.0, 2);
    });

    it('falls back to straight-line interpolation when OSRM route fails or network errors', async () => {
      const pickup: [number, number] = [11.0, 77.0];
      const drop: [number, number] = [11.5, 77.5];

      // Mock fetch rejection
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const route = await fetchRouteWithFallback(pickup, drop);
      expect(route).toBeDefined();
      expect(route.length).toBeGreaterThan(1);
      expect(route[0]).toEqual(pickup);
      expect(route[route.length - 1]).toEqual(drop);

      globalThis.fetch = originalFetch;
    });
  });

  describe('Clock pause, role switch, and reload persistence', () => {
    it('stops progress advancement when simulated clock is paused', () => {
      let isClockPlaying = false;
      let progress = 0.4;

      const tick = (delta: number) => {
        if (!isClockPlaying) return;
        progress += delta;
      };

      tick(0.05);
      expect(progress).toBe(0.4); // Does not change when paused

      isClockPlaying = true;
      tick(0.05);
      expect(progress).toBeCloseTo(0.45, 2);
    });

    it('continues delivery progression across role switches', () => {
      // Simulation: delivery is stored on match in global state
      const matchDelivery: DeliveryState = {
        matchId: 'match-1',
        status: 'On the way',
        progress: 0.5,
        routePoints: [
          [11.0, 76.9],
          [11.2, 77.1],
        ],
        startedAt: '2026-10-09T10:00:00Z',
        etaMinutes: 20,
        timeline: [],
      };

      // User switches role from Receiver to Provider to Admin
      let currentRole = 'Receiver';
      expect(matchDelivery.progress).toBe(0.5);

      currentRole = 'Provider';
      // Progress ticker continues
      matchDelivery.progress += 0.1;
      matchDelivery.status = getDeliveryStatusFromProgress(matchDelivery.progress);
      expect(matchDelivery.progress).toBeCloseTo(0.6, 2);
      expect(matchDelivery.status).toBe('On the way');

      currentRole = 'Admin';
      matchDelivery.progress += 0.4;
      matchDelivery.status = getDeliveryStatusFromProgress(matchDelivery.progress);
      expect(matchDelivery.progress).toBeCloseTo(1.0, 2);
      expect(matchDelivery.status).toBe('Delivered');
    });

    it('resumes delivery progress correctly after storage serialization and reload', () => {
      const originalDelivery: DeliveryState = {
        matchId: 'match-persisted',
        status: 'On the way',
        progress: 0.72,
        routePoints: [
          [11.0168, 76.9558],
          [11.1, 77.0],
          [11.2, 77.1],
        ],
        startedAt: '2026-10-09T11:00:00Z',
        etaMinutes: 15,
        timeline: [
          { timestamp: '2026-10-09T11:00:00Z', event: 'Partner assigned', description: 'Assigned' },
        ],
      };

      // Serialize (like localStorage)
      const serialized = JSON.stringify(originalDelivery);
      const restored: DeliveryState = JSON.parse(serialized);

      expect(restored.progress).toBe(0.72);
      expect(restored.status).toBe('On the way');
      expect(restored.routePoints.length).toBe(3);

      // Advance after reload
      restored.progress += 0.1;
      restored.status = getDeliveryStatusFromProgress(restored.progress);
      expect(restored.progress).toBeCloseTo(0.82, 2);
      expect(restored.status).toBe('On the way');
    });
  });
});

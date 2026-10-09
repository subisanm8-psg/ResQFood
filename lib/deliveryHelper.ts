import { DeliveryProgressStatus } from '../types';

/**
 * Maps a delivery progress value (0 to 1) to its corresponding status.
 * Progress ranges:
 * - 0: 'Partner assigned'
 * - 0 to 0.25: 'Heading to pickup'
 * - 0.25 to 0.3: 'Picked up' (loading)
 * - 0.3 to 1.0: 'On the way'
 * - 1.0: 'Delivered'
 */
export function getDeliveryStatusFromProgress(progress: number): DeliveryProgressStatus {
  if (progress >= 1) return 'Delivered';
  if (progress >= 0.3) return 'On the way';
  if (progress >= 0.25) return 'Picked up';
  if (progress > 0) return 'Heading to pickup';
  return 'Partner assigned';
}

/**
 * Generates a fallback straight-line route between pickup and drop with intermediate steps
 */
export function generateStraightLineRoute(
  pickup: [number, number],
  drop: [number, number],
  steps: number = 20
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = pickup[0] + (drop[0] - pickup[0]) * t;
    const lng = pickup[1] + (drop[1] - pickup[1]) * t;
    points.push([lat, lng]);
  }
  return points;
}

/**
 * Interpolates coordinates along route points based on progress (0 to 1)
 */
export function interpolateRoutePosition(
  routePoints: [number, number][],
  progress: number
): { lat: number; lng: number } {
  if (!routePoints || routePoints.length === 0) {
    return { lat: 11.0168, lng: 76.9558 };
  }
  if (routePoints.length === 1 || progress <= 0) {
    return { lat: routePoints[0][0], lng: routePoints[0][1] };
  }
  if (progress >= 1) {
    const last = routePoints[routePoints.length - 1];
    return { lat: last[0], lng: last[1] };
  }

  // Calculate cumulative segment distances
  const distances: number[] = [0];
  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];
    const dLat = p2[0] - p1[0];
    const dLng = p2[1] - p1[1];
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    totalDistance += dist;
    distances.push(totalDistance);
  }

  if (totalDistance === 0) {
    return { lat: routePoints[0][0], lng: routePoints[0][1] };
  }

  const targetDist = progress * totalDistance;

  // Find segment
  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      const segLength = distances[i + 1] - distances[i];
      const segT = segLength === 0 ? 0 : (targetDist - distances[i]) / segLength;
      const p1 = routePoints[i];
      const p2 = routePoints[i + 1];
      return {
        lat: p1[0] + (p2[0] - p1[0]) * segT,
        lng: p1[1] + (p2[1] - p1[1]) * segT,
      };
    }
  }

  const last = routePoints[routePoints.length - 1];
  return { lat: last[0], lng: last[1] };
}

/**
 * Fetches turn-by-turn road route from public OSRM API with a 5-second timeout.
 * If request fails or times out, immediately falls back to straight-line interpolation.
 */
export async function fetchRouteWithFallback(
  pickup: [number, number],
  drop: [number, number]
): Promise<[number, number][]> {
  const fallback = generateStraightLineRoute(pickup, drop);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${drop[1]},${drop[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    if (data?.routes?.[0]?.geometry?.coordinates && data.routes[0].geometry.coordinates.length > 0) {
      const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      );
      return coords;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

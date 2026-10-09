/**
 * Pure distance and travel time calculation utilities using Haversine formula
 */

/**
 * Calculates great-circle distance between two points in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Section 6: Use 25 km/h inside a city (under 8 km) and 40 km/h between towns (8 km and above)
 */
export function getSpeedKmh(distanceKm: number): number {
  return distanceKm < 8 ? 25 : 40;
}

/**
 * Calculates travel ETA in minutes based on urban (25 km/h) vs inter-town (40 km/h) speed
 */
export function calculateEtaMinutes(
  distanceKm: number,
  speedKmh?: number
): number {
  if (distanceKm <= 0) return 5; // Minimum dispatch buffer
  const speed = speedKmh !== undefined ? speedKmh : getSpeedKmh(distanceKm);
  const hours = distanceKm / speed;
  const minutes = Math.round(hours * 60);
  return Math.max(5, minutes);
}

/**
 * Total handling and transit buffer in minutes (20 minutes default buffer per spec)
 */
export const HANDLING_BUFFER_MINUTES = 20;

/**
 * Returns estimated delivery time given current timestamp and travel distance
 */
export function getEstimatedDeliveryDate(
  currentTime: Date | string,
  distanceKm: number,
  handlingBufferMinutes: number = HANDLING_BUFFER_MINUTES
): Date {
  const current = new Date(currentTime);
  const etaMins = calculateEtaMinutes(distanceKm);
  return new Date(current.getTime() + (etaMins + handlingBufferMinutes) * 60 * 1000);
}

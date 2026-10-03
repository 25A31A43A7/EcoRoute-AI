/**
 * Geo calculation utilities using Haversine formula
 * All distances returned are labeled "Estimated Distance" (as per requirements)
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle estimated distance between two coordinates in kilometers using Haversine formula
 */
export function calculateEstimatedDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Computes estimated travel duration in minutes based on configurable average speed
 */
export function calculateEstimatedTravelTimeMinutes(
  distanceKm: number,
  averageSpeedKmH: number
): number {
  if (distanceKm <= 0 || averageSpeedKmH <= 0) return 0;
  const hours = distanceKm / averageSpeedKmH;
  return Math.round(hours * 60);
}

/**
 * Computes total estimated distance for a sequenced route of coordinates
 */
export function calculateRouteTotalDistanceKm(points: { latitude: number; longitude: number }[]): number {
  if (points.length < 2) return 0;
  let totalKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalKm += calculateEstimatedDistanceKm(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
  }
  return Math.round(totalKm * 100) / 100;
}

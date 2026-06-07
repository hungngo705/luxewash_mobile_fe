/**
 * Location Service
 * Handles device GPS location and address geocoding via OpenStreetMap Nominatim.
 * Nominatim is free and requires no API key.
 */

import * as ExpoLocation from 'expo-location';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Simple in-memory cache for geocoded addresses (key = normalized address)
const geocodeCache = new Map<string, GeoPoint | null>();

/**
 * Request device location permission and get current coordinates.
 * Returns null if permission denied or unavailable.
 */
export async function getCurrentPosition(): Promise<GeoPoint | null> {
  try {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Geocode a Vietnamese address string to lat/lng using OSM Nominatim.
 * Returns null if the address cannot be resolved.
 * Results are cached in memory for the session.
 */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!address || !address.trim()) return null;

  // Normalize key for cache lookup
  const cacheKey = address.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  try {
    const query = encodeURIComponent(`${address}, Vietnam`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=vn`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LuxeWashMobile/1.0',
        'Accept-Language': 'vi,en',
      },
    });

    if (!response.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const first = results[0];
    const point: GeoPoint = {
      latitude: parseFloat(first.lat),
      longitude: parseFloat(first.lon),
    };

    geocodeCache.set(cacheKey, point);
    return point;
  } catch {
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Clear the geocode cache (useful if you want to force re-geocode).
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}

/**
 * Calculate distance between two points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format a distance in km to a human-readable string.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export const locationService = {
  getCurrentPosition,
  geocodeAddress,
  clearGeocodeCache,
  calculateDistance,
  formatDistance,
};

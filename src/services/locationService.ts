/**
 * Location Service
 * Handles device GPS location and address geocoding via Goong API.
 * Goong is optimized for Vietnamese addresses (drop-in replacement for Google Maps Geocoding).
 * Requires a Goong API key. Sign up at https://account.goong.io
 *
 * Add your API key to .env:
 *   EXPO_PUBLIC_GOONG_API_KEY=your_key_here
 * Or set GOONG_API_KEY via EAS secrets / expo config for production builds.
 * Falls back to Nominatim if no key is configured.
 */

import * as ExpoLocation from 'expo-location';
import Constants from 'expo-constants';
import { getCached, setCached, setCachedMany } from './geoCacheService';
import { type BranchDTO } from './api';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const GPS_TIMEOUT_MS = 15000;
const GPS_MAX_RETRIES = 3;

const VIETNAM_BOUNDS = {
  minLat: 8.3,
  maxLat: 23.5,
  minLng: 102.1,
  maxLng: 109.5,
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isVietnamLocation(lat: number, lng: number): boolean {
  return (
    lat >= VIETNAM_BOUNDS.minLat &&
    lat <= VIETNAM_BOUNDS.maxLat &&
    lng >= VIETNAM_BOUNDS.minLng &&
    lng <= VIETNAM_BOUNDS.maxLng
  );
}

function isValidLocation(lat: number, lng: number): boolean {
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    isVietnamLocation(lat, lng)
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Request device location permission and get current coordinates.
 * Retries up to MAX_RETRIES times with exponential backoff on failure.
 * Falls back to last-known location ONLY if it is within Vietnam bounds.
 * Returns null if no valid Vietnam location is available.
 */
export async function getCurrentPosition(): Promise<GeoPoint | null> {
  try {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    for (let attempt = 0; attempt < GPS_MAX_RETRIES; attempt++) {
      try {
        const location = await withTimeout(
          ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.High,
          }),
          GPS_TIMEOUT_MS,
          null,
        );

        if (location) {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          if (isValidLocation(lat, lng)) {
            return { latitude: lat, longitude: lng };
          }
        }

        if (attempt < GPS_MAX_RETRIES - 1) {
          await delay(500 * Math.pow(2, attempt));
        }
      } catch {
        if (attempt < GPS_MAX_RETRIES - 1) {
          await delay(500 * Math.pow(2, attempt));
        }
      }
    }

    try {
      const last = await ExpoLocation.getLastKnownPositionAsync();
      if (last) {
        const lat = last.coords.latitude;
        const lng = last.coords.longitude;
        if (isValidLocation(lat, lng)) {
          return { latitude: lat, longitude: lng };
        }
      }
    } catch {
      // ignore
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Geocode a Vietnamese address string to lat/lng.
 * Uses Goong API if EXPO_PUBLIC_GOONG_API_KEY is set (best for Vietnam addresses).
 * Falls back to Nominatim if no key is configured.
 * Checks persistent cache first; caches result on success.
 * Returns null if the address cannot be resolved.
 */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!address?.trim()) return null;

  const normalized = address.trim().toLowerCase().replace(/\s+/g, ' ');

  const cached = await getCached(normalized);
  if (cached) return cached;

  const apiKey =
    Constants.expoConfig?.extra?.GOONG_API_KEY ??
    process.env.EXPO_PUBLIC_GOONG_API_KEY;

  try {
    let url: string;
    let parseResult: (data: unknown) => GeoPoint | null;

    if (apiKey) {
      url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address + ', Vietnam')}&api_key=${apiKey}`;

      parseResult = (data: unknown) => {
        const d = data as { results: { geometry: { location: { lat: number; lng: number } } }[] };
        if (!d.results?.length || !d.results[0]?.geometry?.location) return null;
        const { lat, lng } = d.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      };
    } else {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Vietnam')}&format=json&limit=1&countrycodes=vn`;

      parseResult = (data: unknown) => {
        const d = data as Array<{ lat?: string; lon?: string }>;
        if (!Array.isArray(d) || d.length === 0 || !d[0]?.lat || !d[0]?.lon) return null;
        return { latitude: parseFloat(d[0].lat), longitude: parseFloat(d[0].lon) };
      };
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LuxeWashMobile/1.0',
        'Accept-Language': 'vi,en',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const point = parseResult(data);
    if (!point) return null;

    await setCached(normalized, point);
    return point;
  } catch {
    return null;
  }
}

/**
 * Geocode a batch of branches sequentially to respect rate limits.
 * Returns a map of branchId -> GeoPoint for successfully geocoded branches.
 */
export async function geocodeBranches(
  branches: BranchDTO[],
  onProgress?: (done: number, total: number) => void,
): Promise<Map<number, GeoPoint>> {
  const result = new Map<number, GeoPoint>();
  const toGeocode: Array<{ branch: BranchDTO; address: string }> = [];

  for (const branch of branches) {
    if (branch.latitude != null && branch.longitude != null) {
      result.set(branch.branchId, { latitude: branch.latitude, longitude: branch.longitude });
      continue;
    }
    if (!branch.address) continue;

    const normalized = branch.address.trim().toLowerCase().replace(/\s+/g, ' ');
    const cached = await getCached(normalized);
    if (cached) {
      result.set(branch.branchId, cached);
    } else {
      toGeocode.push({ branch, address: branch.address });
    }
  }

  const pending: Array<{ address: string; coords: GeoPoint }> = [];

  for (let i = 0; i < toGeocode.length; i++) {
    const { branch, address } = toGeocode[i];

    const coords = await geocodeAddress(address);
    if (coords) {
      result.set(branch.branchId, coords);
      pending.push({ address, coords });
    }

    onProgress?.(result.size, branches.length);

    if (i < toGeocode.length - 1) {
      if ((i + 1) % 5 === 0) {
        await delay(2000);
      } else {
        await delay(400);
      }
    }
  }

  if (pending.length > 0) {
    await setCachedMany(pending.map(p => ({ address: p.address, coords: p.coords })));
  }

  return result;
}

/**
 * Clear the geocode cache (forces re-geocoding on next load).
 */
export async function clearGeocodeCache(): Promise<void> {
  const { clearCache } = await import('./geoCacheService');
  await clearCache();
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
  const R = 6371;
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
  geocodeBranches,
};

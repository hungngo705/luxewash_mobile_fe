/**
 * Persistent geocode cache using AsyncStorage.
 * Caches geocoded addresses to avoid re-hitting Nominatim on every app open.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_KEY = '@luxewash_geo_cache';

interface CachedEntry {
  latitude: number;
  longitude: number;
  cachedAt: number;
}

interface GeoCache {
  [normalizedAddress: string]: CachedEntry;
}

const isWeb = Platform.OS === 'web';

const webCache: GeoCache = {};

async function webGet<T>(key: string): Promise<T | null> {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

async function webSet(key: string, value: unknown): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

async function webDel(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

async function getCache(): Promise<GeoCache> {
  if (isWeb) {
    return webGet<GeoCache>(CACHE_KEY) ?? {};
  }
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as GeoCache) : {};
  } catch {
    return {};
  }
}

async function saveCache(cache: GeoCache): Promise<void> {
  if (isWeb) {
    Object.assign(webCache, cache);
    await webSet(CACHE_KEY, cache);
  } else {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }
}

function normalize(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Look up a cached coordinate for an address. Returns null if not cached. */
export async function getCached(address: string | null | undefined): Promise<{ latitude: number; longitude: number } | null> {
  if (!address) return null;
  const cache = await getCache();
  return cache?.[normalize(address)] ?? null;
}

/** Store a geocoded result for an address. */
export async function setCached(
  address: string | null | undefined,
  coords: { latitude: number; longitude: number },
): Promise<void> {
  if (!address) return;
  const cache = await getCache();
  if (!cache) return;
  cache[normalize(address)] = { ...coords, cachedAt: Date.now() };
  await saveCache(cache);
}

/** Batch-cache multiple results. */
export async function setCachedMany(
  entries: Array<{ address: string | null | undefined; coords: { latitude: number; longitude: number } }>,
): Promise<void> {
  const valid = entries.filter(e => !!e.address);
  if (valid.length === 0) return;
  const cache = await getCache();
  if (!cache) return;
  for (const { address, coords } of valid) {
    cache[normalize(address!)] = { ...coords, cachedAt: Date.now() };
  }
  await saveCache(cache);
}

/** Clear the entire geocode cache. */
export async function clearCache(): Promise<void> {
  if (isWeb) {
    Object.keys(webCache).forEach(k => delete webCache[k]);
    await webDel(CACHE_KEY);
  } else {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
}

/** Get count of cached entries. */
export async function cacheSize(): Promise<number> {
  const cache = await getCache();
  return Object.keys(cache).length;
}

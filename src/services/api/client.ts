/**
 * LuxeWash API Client
 * Handles HTTP requests with fetch, interceptors, and persistent token management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'https://smartwash-be.onrender.com/api/v1';
const ACCESS_TOKEN_KEY = '@luxewash_access_token';
const REFRESH_TOKEN_KEY = '@luxewash_refresh_token';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  details: unknown;
}

const isWeb = Platform.OS === 'web';

const webStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const setTokens = async (token: string, refresh: string) => {
  if (isWeb) {
    webStorage.setItem(ACCESS_TOKEN_KEY, token);
    webStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } else {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};

export const clearTokens = async () => {
  if (isWeb) {
    webStorage.removeItem(ACCESS_TOKEN_KEY);
    webStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getStoredTokens = async (): Promise<{ accessToken: string | null; refreshToken: string | null }> => {
  if (isWeb) {
    const accessToken = webStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = webStorage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  }
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  return { accessToken, refreshToken };
};

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const processQueue = (error: ApiError | null) => {
  refreshQueue.forEach(promise => {
    if (error) promise();
    else promise();
  });
  refreshQueue = [];
};

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown,
  retryRefresh = false,
): Promise<ApiResponse<T>> {
  const { accessToken, refreshToken } = await getStoredTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = { method, headers };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new ApiError(0, 'Network error. Please check your connection.', null);
  }

  if (response.status === 401 && !retryRefresh && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const text = await refreshResponse.text();
          if (text) {
            const data = JSON.parse(text) as ApiResponse<{
              token: string;
              refreshToken: string;
            }>;
            if (data.statusCode === 200 && data.data?.token) {
              await setTokens(data.data.token, data.data.refreshToken);
              processQueue(null);
              isRefreshing = false;
              return request<T>(method, endpoint, body, true);
            }
          }
        }

        await clearTokens();
        processQueue(new ApiError(401, 'Session expired. Please login again.', null));
      } catch {
        await clearTokens();
        processQueue(new ApiError(401, 'Session expired. Please login again.', null));
      }
      isRefreshing = false;
    }

    return new Promise(resolve => {
      refreshQueue.push(() => {
        resolve(request<T>(method, endpoint, body, true));
      });
    });
  }

  let data: ApiResponse<T> | null = null;

  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text) as ApiResponse<T>;
    }
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || `Request failed with status ${response.status}`,
      data?.details,
    );
  }

  if (data === null) {
    return {
      statusCode: response.status,
      message: response.statusText,
      data: null as T,
      details: null,
    };
  }

  return data;
}

async function requestFormData<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  formData: FormData,
  retryRefresh = false,
): Promise<ApiResponse<T>> {
  const { accessToken, refreshToken } = await getStoredTokens();

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: formData,
    });
  } catch (networkError) {
    throw new ApiError(0, 'Network error. Please check your connection.', null);
  }

  if (response.status === 401 && !retryRefresh && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const text = await refreshResponse.text();
          if (text) {
            const data = JSON.parse(text) as ApiResponse<{
              token: string;
              refreshToken: string;
            }>;
            if (data.statusCode === 200 && data.data?.token) {
              await setTokens(data.data.token, data.data.refreshToken);
              processQueue(null);
              isRefreshing = false;
              return requestFormData<T>(method, endpoint, formData, true);
            }
          }
        }

        await clearTokens();
        processQueue(new ApiError(401, 'Session expired. Please login again.', null));
      } catch {
        await clearTokens();
        processQueue(new ApiError(401, 'Session expired. Please login again.', null));
      }
      isRefreshing = false;
    }

    return new Promise(resolve => {
      refreshQueue.push(() => {
        resolve(requestFormData<T>(method, endpoint, formData, true));
      });
    });
  }

  let data: ApiResponse<T> | null = null;

  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text) as ApiResponse<T>;
    }
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || `Request failed with status ${response.status}`,
      data?.details,
    );
  }

  if (data === null) {
    return {
      statusCode: response.status,
      message: response.statusText,
      data: null as T,
      details: null,
    };
  }

  return data;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>('GET', endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>('POST', endpoint, body),
  postForm: <T>(endpoint: string, formData: FormData) => requestFormData<T>('POST', endpoint, formData),
  put: <T>(endpoint: string, body?: unknown) => request<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string) => request<T>('DELETE', endpoint),
};

export { BASE_URL };

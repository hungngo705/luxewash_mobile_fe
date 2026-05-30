/**
 * LuxeWash API Client
 * Handles HTTP requests with fetch, interceptors, and token management
 */

const BASE_URL = "https://smartwash-be.onrender.com/api/v1";

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  details: unknown;
}

const tokenStore: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

export const setTokens = (token: string, refresh: string) => {
  tokenStore.accessToken = token;
  tokenStore.refreshToken = refresh;
};

export const clearTokens = () => {
  tokenStore.accessToken = null;
  tokenStore.refreshToken = null;
};

export const getTokens = () => ({ ...tokenStore });

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: unknown,
  retryRefresh = false,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = tokenStore.accessToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new ApiError(0, "Network error. Please check your connection.", null);
  }

  if (response.status === 401 && !retryRefresh && tokenStore.refreshToken) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokenStore.refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshText = await refreshResponse.text();
        if (refreshText) {
          const refreshData = JSON.parse(refreshText) as ApiResponse<{
            Token: string;
            RefreshToken: string;
          }>;
          if (refreshData.statusCode === 200 && refreshData.data) {
            setTokens(refreshData.data.Token, refreshData.data.RefreshToken);
            return request<T>(method, endpoint, body, true);
          }
        }
      }

      clearTokens();
    } catch {
      clearTokens();
    }

    throw new ApiError(401, "Session expired. Please login again.", null);
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
  get: <T>(endpoint: string) => request<T>("GET", endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body?: unknown) => request<T>("PUT", endpoint, body),
  delete: <T>(endpoint: string) => request<T>("DELETE", endpoint),
};

export { BASE_URL };

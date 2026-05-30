/**
 * Auth API Service
 * Handles authentication endpoints
 */

import { apiClient, ApiResponse, setTokens, clearTokens } from './client';

export interface RegisterRequest {
  phoneNumber: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  phoneOrEmail: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  phoneNumber: string;
  fullName: string;
  token: string;
  refreshToken: string;
  role: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  phoneNumber: string;
  tierName: string;
  totalPoint: number;
  promotionPoint: number;
  churnScore: number;
  vehicles: Array<{
    licensePlate: string;
    vehicleType: string;
  }>;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    if (response.data?.token) {
      setTokens(response.data.token, response.data.refreshToken);
    }
    return response;
  },

  refreshToken: async (refresh: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh-token', { refreshToken: refresh });
    if (response.data?.token) {
      setTokens(response.data.token, response.data.refreshToken);
    }
    return response;
  },

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get<UserProfile>('/users/me');
  },

  logout: () => {
    clearTokens();
  },
};

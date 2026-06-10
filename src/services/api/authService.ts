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
    vehicleTypeId: number;
    vehicleType: string;
    registrationPhotoUrl: string | null;
    carModel: string | null;
  }>;
  dateOfBirth: string | null;
  email: string | null;
  status: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  userId: number;
  email: string;
  status: string;
  otpExpiresAt: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    if (response.data?.token) {
      await setTokens(response.data.token, response.data.refreshToken);
    }
    return response;
  },

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get<UserProfile>('/users/me');
  },

  refreshToken: async (refresh: string): Promise<ApiResponse<RefreshTokenResponse>> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken: refresh });
  },

  logout: async () => {
    await clearTokens();
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/auth/change-password', data);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<void>> => {
    return apiClient.put<void>('/users/me', data);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>('/auth/verify-otp', data);
    if (response.data?.token) {
      await setTokens(response.data.token, response.data.refreshToken);
    }
    return response;
  },

  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse<ResendOtpResponse>> => {
    return apiClient.post<ResendOtpResponse>('/auth/resend-otp', data);
  },
};

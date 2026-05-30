/**
 * API Service Index
 * Re-exports all services for convenient imports
 */

export { apiClient, ApiResponse, ApiError, setTokens, clearTokens, getStoredTokens, BASE_URL } from './client';
export { authService } from './authService';
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  RefreshTokenResponse,
} from './authService';
export { vehicleService } from './vehicleService';
export type { VehicleResponse } from './vehicleService';
export { uploadImage } from './uploadService';
export type { UploadResult } from './uploadService';
export { bookingService } from './bookingService';
export type {
  TimeSlot,
  Service,
  ServicePrice,
  BookingRequest,
  BookingDetail,
  BookingDetailVehicle,
  CreateBookingResponse,
} from './bookingService';
export { walletService } from './walletService';
export type { WalletBalance, TopUpRequest } from './walletService';
export { loyaltyService } from './loyaltyService';
export type { Tier, Voucher } from './loyaltyService';

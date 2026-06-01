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
  ChangePasswordRequest,
  UpdateProfileRequest,
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
export type { WalletBalance, TopUpRequest, Transaction, TransactionType, TransactionStatus } from './walletService';
export { loyaltyService } from './loyaltyService';
export type { Tier, Voucher, VoucherCatalogItem } from './loyaltyService';

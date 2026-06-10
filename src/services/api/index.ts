/**
 * API Service Index
 * Re-exports all services for convenient imports
 */

export { authService } from "./authService";
export type {
    ChangePasswordRequest, LoginRequest,
    LoginResponse, RefreshTokenResponse, RegisterRequest, UpdateProfileRequest, UserProfile
} from "./authService";
export { bookingService } from "./bookingService";
export type {
    BookingDetail, BookingDetailResponse, BookingDetailVehicle, BookingRequest,
    CompatibilityDTO, CreateBookingResponse, GetMyBookingsParams, MyBookingItem, Service,
    ServicePrice, TimeSlot
} from "./bookingService";
export { branchService } from "./branchService";
export type { BranchDTO } from "./branchService";
export {
    ApiError, ApiResponse, BASE_URL, apiClient, clearTokens,
    getStoredTokens, setTokens, setSessionExpiredHandler, clearSessionExpiredHandler
} from "./client";
export { loyaltyService } from "./loyaltyService";
export {
    Tier,
    Voucher,
    VoucherCampaignType,
    VoucherType,
    CAMPAIGN_BADGE_CONFIG,
} from "./loyaltyService";
export { vehicleService } from "./vehicleService";
export type { CarModel, VehicleResponse } from "./vehicleService";
export { walletService } from "./walletService";
export type {
    TopUpRequest,
    Transaction, TransactionStatus, TransactionType, WalletBalance
} from "./walletService";


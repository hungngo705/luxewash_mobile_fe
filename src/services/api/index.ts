/**
 * API Service Index
 * Re-exports all services for convenient imports
 */

export { authService } from "./authService";
export type {
    ChangePasswordRequest, LoginRequest,
    LoginResponse, RefreshTokenRequest, RefreshTokenResponse, RegisterRequest, UpdateProfileRequest, UserProfile
} from "./authService";
export { bookingService } from "./bookingService";
export type {
    BookingDetail, BookingDetailResponse, BookingDetailVehicle, BookingRequest,
    BookingPaymentLinkRequest, BookingPaymentLinkResponse, BookingPaymentStatus,
    BookingPaymentStatusResponse,
    CompatibilityDTO, CreateBookingResponse, GetMyBookingsParams, MyBookingItem,
    RescheduleBookingRequest, Service,
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
export type { CarModel, RequestCarModelPayload, VehicleResponse } from "./vehicleService";
export { walletService } from "./walletService";
export type {
    TopUpRequest,
    Transaction, TransactionStatus, TransactionType, WalletBalance
} from "./walletService";

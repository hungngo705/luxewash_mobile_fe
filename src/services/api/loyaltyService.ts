/**
 * Loyalty API Service
 * Handles loyalty tiers, points, and vouchers
 */

import { apiClient, ApiResponse } from './client';

export interface Tier {
  tierId: number;
  tierName: string;
  pointMultiplier: number;
  minAccumulatedPoints: number;
  bookingWindowDays?: number;
}

export type VoucherCampaignType =
  | 'Manual'
  | 'Birthday'
  | 'Age'
  | 'Winback'
  | 'Vip'
  | 'Milestone';

export type VoucherType = 'Discount' | 'PhysicalGift';

export interface Voucher {
  voucherId: number;
  code: string;
  discountAmount: number;
  pointsRequired: number;
  expiryDate: string;
  campaignExpiryDate: string;
  receivedDate: string;
  isUsed: boolean;
  usedDate: string | null;
  usageCount: number;
  maxUsagePerUser: number;
  remainingUsage: number;
  minOrderAmount: number;
  isActive: boolean;
  campaignType: VoucherCampaignType;
  voucherType: VoucherType;
  imageUrl: string | null;
  requiredTierId: number | null;
  requiredTierName: string | null;
  validStartTime: string | null;
  validEndTime: string | null;
}

export const loyaltyService = {
  getTiers: async (): Promise<ApiResponse<Tier[]>> => {
    return apiClient.get<Tier[]>('/tiers');
  },

  getMyVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return apiClient.get<Voucher[]>('/vouchers/me');
  },

  getAvailableVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return apiClient.get<Voucher[]>('/vouchers/available');
  },

  redeemVoucher: async (voucherId: number): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/vouchers/redeem', { voucherId });
  },
};

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

export type VoucherCampaignType = 0 | 1 | 2 | 3 | 4 | 5;

export type VoucherType = 0 | 1;

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

export const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  [0]: 'Discount',
  [1]: 'PhysicalGift',
};

export const CAMPAIGN_TYPE_LABELS: Record<VoucherCampaignType, string> = {
  [0]: 'Manual',
  [1]: 'Birthday',
  [2]: 'Age',
  [3]: 'Winback',
  [4]: 'Vip',
  [5]: 'Milestone',
};

export const CAMPAIGN_BADGE_CONFIG: Record<VoucherCampaignType, { label: string; bg: string; color: string; icon: string }> = {
  [0]: { label: 'Đổi điểm', bg: '#E0E7FF', color: '#4F46E5', icon: 'tag' },
  [1]: { label: 'Sinh nhật', bg: '#FEF3C7', color: '#D97706', icon: 'gift' },
  [2]: { label: 'Theo tuổi', bg: '#DBEAFE', color: '#2563EB', icon: 'calendar' },
  [3]: { label: 'Quay lại', bg: '#FCE7F3', color: '#DB2777', icon: 'repeat' },
  [4]: { label: 'VIP', bg: '#F3E8FF', color: '#7C3AED', icon: 'star' },
  [5]: { label: 'Kỷ niệm', bg: '#D1FAE5', color: '#059669', icon: 'award' },
};

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

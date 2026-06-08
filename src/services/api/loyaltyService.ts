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

export interface Voucher {
  voucherId: number;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  isUsed: boolean;
  validFrom: string;
  expiryDate: string;
  usedDate: string | null;
}

export const loyaltyService = {
  getTiers: async (): Promise<ApiResponse<Tier[]>> => {
    return apiClient.get<Tier[]>('/tiers');
  },

  getMyVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return apiClient.get<Voucher[]>('/vouchers/me');
  },

  redeemVoucher: async (code: string): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/vouchers/redeem', { code });
  },
};

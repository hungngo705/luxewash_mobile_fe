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
}

export interface Voucher {
  id: number;
  code: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validUntil: string;
  isActive: boolean;
}

export const loyaltyService = {
  getTiers: async (): Promise<ApiResponse<Tier[]>> => {
    return apiClient.get<Tier[]>('/tiers');
  },

  getPointsHistory: async (): Promise<ApiResponse<unknown>> => {
    return apiClient.get<unknown>('/points/history');
  },

  getMyVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    return apiClient.get<Voucher[]>('/vouchers/me');
  },

  redeemVoucher: async (voucherCode: string): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/vouchers/redeem', { voucherCode });
  },
};

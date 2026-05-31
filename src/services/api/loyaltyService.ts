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
  title?: string;
  description?: string;
  discountAmount: number;
  pointsRequired: number;
  expiryDate: string;
  isUsed: boolean;
  usedDate?: string | null;
}

export interface VoucherCatalogItem {
  voucherId: number;
  code: string;
  title?: string;
  description?: string;
  discountAmount: number;
  pointsRequired: number;
  expiryDate: string;
  isRedeemed: boolean;
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

  getCatalog: async (): Promise<ApiResponse<VoucherCatalogItem[]>> => {
    return apiClient.get<VoucherCatalogItem[]>('/vouchers/catalog');
  },
};

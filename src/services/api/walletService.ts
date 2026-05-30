/**
 * Wallet API Service
 * Handles wallet balance, top-up, and transactions
 */

import { apiClient, ApiResponse } from './client';

export interface WalletBalance {
  balance: number;
  totalPoints: number;
  promotionPoints: number;
}

export interface TopUpRequest {
  amount: number;
  cancelUrl: string;
  returnUrl: string;
}

export const walletService = {
  getBalance: async (): Promise<ApiResponse<WalletBalance>> => {
    return apiClient.get<WalletBalance>('/wallets/me');
  },

  topUp: async (data: TopUpRequest): Promise<ApiResponse<{ checkoutUrl: string }>> => {
    return apiClient.post<{ checkoutUrl: string }>('/wallets/top-up', data);
  },

  getTransactions: async (): Promise<ApiResponse<unknown>> => {
    return apiClient.get<unknown>('/transactions');
  },
};

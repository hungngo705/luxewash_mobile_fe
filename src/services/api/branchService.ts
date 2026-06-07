/**
 * Branch API Service
 * Handles branch/endpoints for the customer booking flow
 */

import { apiClient, ApiResponse } from './client';

export interface BranchDTO {
  branchId: number;
  name: string;
  address: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
}

export const branchService = {
  getBranches: async (): Promise<ApiResponse<BranchDTO[]>> => {
    return apiClient.get<BranchDTO[]>('/branches');
  },
};

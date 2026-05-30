/**
 * Vehicle API Service
 * Handles vehicle management endpoints
 */

import { apiClient, ApiResponse } from './client';

export interface VehicleResponse {
  licensePlate: string;
  vehicleType: string;
}

export const vehicleService = {
  getMyVehicles: async (): Promise<ApiResponse<VehicleResponse[]>> => {
    return apiClient.get<VehicleResponse[]>('/vehicles');
  },

  addVehicle: async (data: {
    licensePlate: string;
    vehicleTypeId: number;
  }): Promise<ApiResponse<VehicleResponse>> => {
    return apiClient.post<VehicleResponse>('/vehicles', data);
  },

  deleteVehicle: async (licensePlate: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/vehicles/${encodeURIComponent(licensePlate)}`);
  },
};

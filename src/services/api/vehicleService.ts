/**
 * Vehicle API Service
 * Handles vehicle management endpoints
 */

import { apiClient, ApiResponse } from './client';

export interface VehicleType {
  id: number;
  name: string;
}

export interface VehicleResponse {
  licensePlate: string;
  vehicleType: string;
}

export const vehicleService = {
  getVehicleTypes: async (): Promise<ApiResponse<VehicleType[]>> => {
    return apiClient.get<VehicleType[]>('/admin/vehicle-types');
  },

  getMyVehicles: async (): Promise<ApiResponse<VehicleResponse[]>> => {
    return apiClient.get<VehicleResponse[]>('/vehicles');
  },

  addVehicle: async (data: {
    licensePlate: string;
    vehicleTypeId: number;
    registrationPhotoUrl?: string;
    userNote?: string;
  }): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/vehicles', data);
  },

  deleteVehicle: async (licensePlate: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/vehicles/${encodeURIComponent(licensePlate)}`);
  },
};

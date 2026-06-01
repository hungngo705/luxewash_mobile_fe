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
  vehicleTypeId: number;
  vehicleType: string;
  registrationPhotoUrl: string;
  carModel: string | null;
}

export const vehicleService = {
  getVehicleTypes: async (): Promise<ApiResponse<VehicleType[]>> => {
    return apiClient.get<VehicleType[]>('/admin/vehicle-types');
  },

  getMyVehicles: async (): Promise<ApiResponse<VehicleResponse[]>> => {
    return apiClient.get<VehicleResponse[]>('/vehicles');
  },

  /**
   * Add a vehicle. Pass photoFile (Blob/File) for direct Cloudinary upload,
   * or registrationPhotoUrl (string) for a pre-uploaded image URL.
   * PhotoFile takes priority when both are provided.
   */
  addVehicle: async (data: {
    licensePlate: string;
    vehicleTypeId: number;
    registrationPhotoUrl?: string;
    photoFile?: Blob;
    userNote?: string;
  }): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('licensePlate', data.licensePlate);
    formData.append('vehicleTypeId', String(data.vehicleTypeId));
    if (data.photoFile) {
      // Backend expects field name 'PhotoFile'
      formData.append('PhotoFile', data.photoFile);
    }
    if (data.registrationPhotoUrl) {
      formData.append('registrationPhotoUrl', data.registrationPhotoUrl);
    }
    if (data.userNote) {
      formData.append('userNote', data.userNote);
    }
    return apiClient.postForm<void>('/vehicles', formData);
  },

  deleteVehicle: async (licensePlate: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/vehicles/${encodeURIComponent(licensePlate)}`);
  },
};

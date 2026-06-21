/**
 * Vehicle API Service
 * Handles vehicle management endpoints
 */

import { apiClient, ApiResponse } from './client';

export interface VehicleType {
  id: number;
  name: string;
}

export interface CarModel {
  id: number;
  brand: string;
  name: string;
  vehicleTypeId?: number | null;
}

export interface VehicleResponse {
  licensePlate: string;
  vehicleTypeId: number;
  vehicleType: string;
  registrationPhotoUrl: string | null;
  carModel: string | null;
  brand: string | null;
  userNote: string | null;
}

export interface RequestCarModelPayload {
  brand: string;
  name: string;
  year?: number | null;
  version?: string | null;
  vehicleTypeId?: number | null;
}

export const vehicleService = {
  getVehicleTypes: async (): Promise<ApiResponse<VehicleType[]>> => {
    return apiClient.get<VehicleType[]>('/admin/vehicle-types');
  },

  getCarModels: async (): Promise<ApiResponse<CarModel[]>> => {
    return apiClient.get<CarModel[]>('/carModels');
  },

  /**
   * Request a new car model (crowdsourcing).
   * POST /api/v1/carmodels/request
   * Returns the new CarModelId.
   */
  requestCarModel: async (
    payload: RequestCarModelPayload,
  ): Promise<ApiResponse<number>> => {
    return apiClient.post<number>('/carModels/request', payload);
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
    vehicleTypeId?: number | null;
    carModel?: string;
    carModelId?: number;
    registrationPhotoUrl?: string;
    photoFile?: Blob;
    userNote?: string;
  }): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('licensePlate', data.licensePlate);
    if (data.vehicleTypeId != null && data.vehicleTypeId > 0) {
      formData.append('vehicleTypeId', String(data.vehicleTypeId));
    }
    if (data.carModelId != null) {
      formData.append('carModelId', String(data.carModelId));
    } else if (data.carModel) {
      formData.append('carModel', data.carModel);
    }
    if (data.photoFile) {
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

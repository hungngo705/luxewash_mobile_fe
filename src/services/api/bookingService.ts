/**
 * Booking API Service
 * Handles booking and scheduling endpoints
 */

import { apiClient, ApiResponse } from './client';

export interface TimeSlot {
  slotId: number;
  timeRange: string;
  isAvailable: boolean;
  reason: string | null;
}

export interface ServicePrice {
  vehicleTypeId: number;
  vehicleTypeName: string;
  price: number;
  capacityWeight: number;
}

export interface Service {
  serviceId: number;
  serviceName: string;
  description: string;
  prices: ServicePrice[];
}

export interface CompatibilityDTO {
  isCompatible: boolean;
  message: string | null;
  remainingCapacity: number;
  totalCapacityWeight: number;
  maxCapacityOfSlot: number;
}

export interface BookingRequest {
  branchId: number;
  vehicleId?: number;
  licensePlate: string;
  serviceIds: number[];
  scheduledDate: string;
  slotId: number;
  pointsToUse: number;
  voucherId: number | null;
}

export interface BookingDetailVehicle {
  detailId: number;
  licensePlate: string;
  vehicleType: string;
  carModel: string | null;
  registrationPhotoUrl: string | null;
  serviceName: string;
  status: string;
  subtotal: number;
}

export interface BookingDetail {
  bookingId: number;
  scheduledDate: string;
  slotId: number;
  timeRange: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  pointsDiscount: number;
  finalAmount: number;
  createdAt: string;
  vehicles: BookingDetailVehicle[];
}

export interface CreateBookingResponse {
  bookingId: number;
}

export interface MyBookingItem {
  bookingId: number;
  licensePlate: string;
  serviceName: string;
  scheduledTime: string;
  status: string;
  originalPrice: number;
  pointDiscountAmount: number;
  voucherDiscountAmount: number;
  finalAmount: number;
}

export interface GetMyBookingsParams {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const bookingService = {
  getServices: async (): Promise<ApiResponse<Service[]>> => {
    return apiClient.get<Service[]>('/services');
  },

  checkCompatibility: async (data: {
    branchId: number;
    slotId: number;
    targetDate: string;
    licensePlate: string;
    vehicleId?: number;
    serviceIds: number[];
  }): Promise<ApiResponse<CompatibilityDTO>> => {
    return apiClient.post<CompatibilityDTO>('/bookings/check-compatibility', data);
  },

  getAvailableSlots: async (
    branchId: number,
    targetDate: string,
    vehicleTypeId: number,
    serviceIds: number[],
  ): Promise<ApiResponse<TimeSlot[]>> => {
    return apiClient.post<TimeSlot[]>('/bookings/available-slots', {
      branchId,
      targetDate,
      vehicleTypeId,
      serviceIds,
    });
  },

  createBooking: async (data: BookingRequest): Promise<ApiResponse<CreateBookingResponse>> => {
    return apiClient.post<CreateBookingResponse>('/bookings', data);
  },

  getMyBookings: async (params?: GetMyBookingsParams): Promise<ApiResponse<MyBookingItem[]>> => {
    return apiClient.get<MyBookingItem[]>('/bookings/me', params);
  },

  cancelBooking: async (bookingId: number): Promise<ApiResponse<void>> => {
    return apiClient.put<void>(`/bookings/${bookingId}/cancel`, {});
  },

  updateBookingStatus: async (bookingId: number, newStatus: string): Promise<ApiResponse<void>> => {
    return apiClient.put<void>(`/admin/bookings/${bookingId}/status`, { newStatus });
  },

  triggerEmail: async (bookingId: number): Promise<ApiResponse<void>> => {
    return apiClient.post<void>(`/bookings/${bookingId}/trigger-email`, {});
  },
};

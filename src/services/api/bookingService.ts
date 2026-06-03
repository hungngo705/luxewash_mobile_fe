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

export interface BookingRequest {
  scheduledDate: string;
  slotId: number;
  pointsToUse: number;
  voucherId: number | null;
  vehicles: Array<{
    licensePlate: string;
    serviceId: number;
  }>;
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

  getAvailableSlots: async (targetDate: string, bookingVehicles: { vehicleTypeId: number; serviceId: number }[]): Promise<ApiResponse<TimeSlot[]>> => {
    return apiClient.post<TimeSlot[]>('/bookings/available-slots', {
      targetDate,
      bookingVehicles,
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

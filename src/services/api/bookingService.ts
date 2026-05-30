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
  serviceName: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
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

export const bookingService = {
  getServices: async (): Promise<ApiResponse<Service[]>> => {
    return apiClient.get<Service[]>('/services');
  },

  getSlots: async (targetDate: string): Promise<ApiResponse<TimeSlot[]>> => {
    return apiClient.get<TimeSlot[]>(`/bookings/slots?targetDate=${targetDate}`);
  },

  createBooking: async (data: BookingRequest): Promise<ApiResponse<CreateBookingResponse>> => {
    return apiClient.post<CreateBookingResponse>('/bookings', data);
  },

  getMyBookings: async (): Promise<ApiResponse<BookingDetail[]>> => {
    return apiClient.get<BookingDetail[]>('/bookings/me');
  },

  cancelBooking: async (bookingId: number): Promise<ApiResponse<void>> => {
    return apiClient.put<void>(`/bookings/${bookingId}/cancel`, {});
  },
};

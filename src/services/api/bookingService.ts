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

export const bookingService = {
  getSlots: async (targetDate: string): Promise<ApiResponse<TimeSlot[]>> => {
    return apiClient.get<TimeSlot[]>(`/bookings/slots?targetDate=${targetDate}`);
  },

  createBooking: async (data: BookingRequest): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/bookings', data);
  },

  getMyBookings: async (): Promise<ApiResponse<unknown>> => {
    return apiClient.get<unknown>('/bookings/me');
  },

  cancelBooking: async (bookingId: number): Promise<ApiResponse<void>> => {
    return apiClient.put<void>(`/bookings/${bookingId}/cancel`, {});
  },
};

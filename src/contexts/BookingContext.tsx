/**
 * Booking Context
 * Manages booking flow state across screens
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  bookingService,
  type TimeSlot,
  type Service,
  type BookingDetail,
  type BookingRequest,
} from '@/services/api';

interface BookingVehicleItem {
  licensePlate: string;
  serviceId: number;
}

interface BookingState {
  // Selected items
  selectedVehicles: BookingVehicleItem[];
  selectedDate: string;
  selectedSlotId: number | null;
  selectedServices: Map<string, number>; // licensePlate -> serviceId
  pointsToUse: number;
  voucherId: number | null;

  // Available data
  services: Service[];
  slots: TimeSlot[];
  myBookings: BookingDetail[];

  // UI state
  isLoadingServices: boolean;
  isLoadingSlots: boolean;
  isSubmitting: boolean;
}

interface BookingContextType extends BookingState {
  // Actions
  loadServices: () => Promise<void>;
  loadSlots: (date: string) => Promise<void>;
  loadMyBookings: () => Promise<void>;
  setSelectedVehicles: (vehicles: BookingVehicleItem[]) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlotId: (slotId: number | null) => void;
  setVehicleService: (licensePlate: string, serviceId: number) => void;
  setPointsToUse: (points: number) => void;
  setVoucherId: (voucherId: number | null) => void;
  createBooking: () => Promise<{ success: boolean; error?: string; bookingId?: number }>;
  cancelBooking: (bookingId: number) => Promise<{ success: boolean; error?: string }>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>({
    selectedVehicles: [],
    selectedDate: new Date().toISOString().split('T')[0],
    selectedSlotId: null,
    selectedServices: new Map(),
    pointsToUse: 0,
    voucherId: null,
    services: [],
    slots: [],
    myBookings: [],
    isLoadingServices: false,
    isLoadingSlots: false,
    isSubmitting: false,
  });

  const loadServices = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoadingServices: true }));
      const response = await bookingService.getServices();
      if (response.statusCode === 200 && response.data) {
        setState(prev => ({ ...prev, services: response.data || [], isLoadingServices: false }));
      } else {
        setState(prev => ({ ...prev, isLoadingServices: false }));
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      setState(prev => ({ ...prev, isLoadingServices: false }));
    }
  }, []);

  const loadSlots = useCallback(async (date: string) => {
    try {
      setState(prev => ({ ...prev, isLoadingSlots: true }));
      const response = await bookingService.getSlots(date);
      if (response.statusCode === 200 && response.data) {
        setState(prev => ({ ...prev, slots: response.data || [], isLoadingSlots: false }));
      } else {
        setState(prev => ({ ...prev, isLoadingSlots: false }));
      }
    } catch (error) {
      console.error('Failed to load slots:', error);
      setState(prev => ({ ...prev, isLoadingSlots: false }));
    }
  }, []);

  const loadMyBookings = useCallback(async () => {
    try {
      const response = await bookingService.getMyBookings();
      if (response.statusCode === 200 && response.data) {
        setState(prev => ({ ...prev, myBookings: response.data || [] }));
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  }, []);

  const setSelectedVehicles = useCallback((vehicles: BookingVehicleItem[]) => {
    setState(prev => ({ ...prev, selectedVehicles: vehicles }));
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    setState(prev => ({ ...prev, selectedDate: date, selectedSlotId: null }));
  }, []);

  const setSelectedSlotId = useCallback((slotId: number | null) => {
    setState(prev => ({ ...prev, selectedSlotId: slotId }));
  }, []);

  const setVehicleService = useCallback((licensePlate: string, serviceId: number) => {
    setState(prev => {
      const newServices = new Map(prev.selectedServices);
      newServices.set(licensePlate, serviceId);
      return { ...prev, selectedServices: newServices };
    });
  }, []);

  const setPointsToUse = useCallback((points: number) => {
    setState(prev => ({ ...prev, pointsToUse: points }));
  }, []);

  const setVoucherId = useCallback((voucherId: number | null) => {
    setState(prev => ({ ...prev, voucherId }));
  }, []);

  const createBooking = useCallback(async (): Promise<{ success: boolean; error?: string; bookingId?: number }> => {
    if (!state.selectedSlotId || state.selectedVehicles.length === 0) {
      return { success: false, error: 'Vui lòng chọn đủ thông tin' };
    }

    // Check all vehicles have services selected
    for (const vehicle of state.selectedVehicles) {
      if (!state.selectedServices.has(vehicle.licensePlate)) {
        return { success: false, error: `Vui lòng chọn dịch vụ cho xe ${vehicle.licensePlate}` };
      }
    }

    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      const request: BookingRequest = {
        scheduledDate: new Date(state.selectedDate).toISOString(),
        slotId: state.selectedSlotId,
        pointsToUse: state.pointsToUse,
        voucherId: state.voucherId,
        vehicles: state.selectedVehicles.map(v => ({
          licensePlate: v.licensePlate,
          serviceId: state.selectedServices.get(v.licensePlate)!,
        })),
      };

      const response = await bookingService.createBooking(request);

      if (response.statusCode === 200) {
        return { success: true, bookingId: response.data?.bookingId };
      } else {
        return { success: false, error: response.message || 'Tạo đặt lịch thất bại' };
      }
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      const apiErr = error as { message?: string };
      return { success: false, error: apiErr.message || 'Đã xảy ra lỗi' };
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.selectedVehicles, state.selectedDate, state.selectedSlotId, state.selectedServices, state.pointsToUse, state.voucherId]);

  const cancelBooking = useCallback(async (bookingId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.statusCode === 200) {
        await loadMyBookings();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Hủy đặt lịch thất bại' };
      }
    } catch (error: unknown) {
      console.error('Failed to cancel booking:', error);
      const apiErr = error as { message?: string };
      return { success: false, error: apiErr.message || 'Đã xảy ra lỗi' };
    }
  }, [loadMyBookings]);

  const resetBooking = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedVehicles: [],
      selectedDate: new Date().toISOString().split('T')[0],
      selectedSlotId: null,
      selectedServices: new Map(),
      pointsToUse: 0,
      voucherId: null,
    }));
  }, []);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        loadServices,
        loadSlots,
        loadMyBookings,
        setSelectedVehicles,
        setSelectedDate,
        setSelectedSlotId,
        setVehicleService,
        setPointsToUse,
        setVoucherId,
        createBooking,
        cancelBooking,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

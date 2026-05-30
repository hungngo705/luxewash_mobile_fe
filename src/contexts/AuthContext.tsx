/**
 * LuxeWash Authentication Context
 * Handles user login/logout state
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Vehicle, AuthUser, LoginCredentials, mockUsers, mockStaffUsers, mockVehicles } from '@/data/types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addVehicle: (vehicle: Vehicle) => boolean;
  removeVehicle: (vehicleId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find user by phone number
      const allUsers = [...mockUsers, ...mockStaffUsers];
      const foundUser = allUsers.find(u => u.phoneNumber === credentials.phoneNumber);

      if (!foundUser) {
        return { success: false, error: 'Số điện thoại không tồn tại' };
      }

      // For demo: password is '123456' for all users, or phone is password for staff
      const validPassword = credentials.password === '123456' || credentials.password === credentials.phoneNumber;
      if (!validPassword) {
        return { success: false, error: 'Mật khẩu không đúng' };
      }

      // Build auth user with vehicles for customers
      let authUser: AuthUser;
      if (foundUser.role === 'customer') {
        const vehicles = mockVehicles.filter(v => v.userId === foundUser.id);
        authUser = { ...foundUser, vehicles };
      } else {
        authUser = { ...foundUser, vehicles: [] };
      }

      setState({ user: authUser, isLoading: false, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Đã xảy ra lỗi. Vui lòng thử lại' };
    }
  };

  const logout = () => {
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const addVehicle = (vehicle: Vehicle): boolean => {
    if (!state.user) return false;

    // Check max 5 vehicles
    if (state.user.vehicles.length >= 5) return false;

    // Check duplicate license plate
    const exists = state.user.vehicles.some(v => v.licensePlate === vehicle.licensePlate);
    if (exists) return false;

    const updatedVehicles = [...state.user.vehicles, vehicle];
    setState({ ...state, user: { ...state.user, vehicles: updatedVehicles } });
    return true;
  };

  const removeVehicle = (vehicleId: string): boolean => {
    if (!state.user) return false;

    const updatedVehicles = state.user.vehicles.filter(v => v.id !== vehicleId);
    setState({ ...state, user: { ...state.user, vehicles: updatedVehicles } });
    return true;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, addVehicle, removeVehicle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock login credentials for demo
export const DEMO_ACCOUNTS = [
  { phone: '0909123456', password: '123456', role: 'customer', name: 'Nguyễn Văn Minh (Gold)' },
  { phone: '0912345678', password: '123456', role: 'customer', name: 'Trần Thị Lan (Platinum)' },
  { phone: '0934567890', password: '123456', role: 'customer', name: 'Lê Hoàng Nam (Standard)' },
  { phone: 'staff001', password: 'staff001', role: 'staff', name: 'Nguyễn Văn An (Receptionist)' },
  { phone: 'staff002', password: 'staff002', role: 'staff', name: 'Phạm Thị Hương (Supervisor)' },
];

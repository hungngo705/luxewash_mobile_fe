/**
 * LuxeWash Authentication Context
 * Handles user login/logout state with real API integration
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle, AuthUser, LoginCredentials } from '../data/types';
import { authService } from '../services/api/authService';
import { ApiError } from '../services/api/client';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (
    phoneNumber: string,
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ success: boolean; error?: string }>;
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
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login({
        phoneOrEmail: credentials.phoneOrEmail,
        password: credentials.password,
      });

      if (response.statusCode !== 200) {
        return { success: false, error: response.message || 'Đăng nhập thất bại' };
      }

      const loginData = response.data;

      const authUser: AuthUser = {
        id: String(loginData.userId),
        phoneNumber: loginData.phoneNumber,
        name: loginData.fullName,
        role: loginData.role?.toLowerCase() || 'customer',
        membershipId: 'standard',
        membershipTier: 'standard' as any,
        loyaltyPoints: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicles: [],
      };

      setState({ user: authUser, isLoading: false, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof ApiError ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại';
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: message };
    }
  };

  const register = async (
    phoneNumber: string,
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.register({
        phoneNumber,
        email,
        password,
        fullName,
      });

      if (response.statusCode !== 201) {
        return { success: false, error: response.message || 'Đăng ký thất bại' };
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const message = error instanceof ApiError ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại';
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authService.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const addVehicle = (vehicle: Vehicle): boolean => {
    if (!state.user) return false;

    if (state.user.vehicles.length >= 5) return false;

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
    <AuthContext.Provider value={{ ...state, login, register, logout, addVehicle, removeVehicle }}>
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

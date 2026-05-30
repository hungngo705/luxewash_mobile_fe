/**
 * LuxeWash Authentication Context
 * Handles user login/logout state with real API integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, AuthUser, LoginCredentials } from '../data/types';
import { authService } from '../services/api/authService';
import { walletService } from '../services/api/walletService';
import { vehicleService } from '../services/api/vehicleService';
import { ApiError, getStoredTokens } from '../services/api/client';

interface AuthState {
  user: AuthUser | null;
  walletBalance: number;
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
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  addVehicle: (licensePlate: string, vehicleTypeId: number, registrationPhotoUrl?: string, userNote?: string) => Promise<{ success: boolean; error?: string }>;
  removeVehicle: (licensePlate: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapVehicleApiToVehicle(v: { licensePlate: string; vehicleType: string }, userId: string): Vehicle {
  return {
    id: v.licensePlate,
    licensePlate: v.licensePlate,
    brand: v.vehicleType,
    model: '',
    color: '',
    userId,
    createdAt: new Date(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    walletBalance: 0,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken, refreshToken } = await getStoredTokens();
        if (!accessToken || !refreshToken) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const profileRes = await authService.getProfile();
        if (profileRes.statusCode === 200 && profileRes.data) {
          const walletRes = await walletService.getBalance();
          const walletBalance = walletRes.statusCode === 200 && walletRes.data ? walletRes.data.balance : 0;
          const profile = profileRes.data;
          const userId = String(profile.id);
          const vehicles = profile.vehicles.map((v) => mapVehicleApiToVehicle(v, userId));

          const authUser: AuthUser = {
            id: userId,
            phoneNumber: profile.phoneNumber,
            name: profile.fullName,
            role: profile.role?.toLowerCase() || 'customer',
            membershipId: profile.tierName?.toLowerCase() || 'standard',
            membershipTier: (profile.tierName?.toLowerCase() || 'standard') as any,
            loyaltyPoints: profile.totalPoint ?? 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            vehicles,
          };

          setState({ user: authUser, walletBalance, isLoading: false, isAuthenticated: true });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, []);

  const fetchProfileAndWallet = async (userId: string) => {
    const [profileRes, walletRes] = await Promise.all([
      authService.getProfile(),
      walletService.getBalance(),
    ]);

    const profile = profileRes.statusCode === 200 && profileRes.data ? profileRes.data : null;
    const wallet = walletRes.statusCode === 200 && walletRes.data ? walletRes.data : null;

    return {
      profile,
      walletBalance: wallet?.balance ?? 0,
      vehicles: profile?.vehicles.map((v) => mapVehicleApiToVehicle(v, userId)) ?? [],
    };
  };

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

      const { walletBalance, vehicles, profile } = await fetchProfileAndWallet(String(loginData.userId));

      const authUser: AuthUser = {
        id: String(loginData.userId),
        phoneNumber: loginData.phoneNumber,
        name: loginData.fullName,
        role: loginData.role?.toLowerCase() || 'customer',
        membershipId: profile?.tierName.toLowerCase() || 'standard',
        membershipTier: (profile?.tierName.toLowerCase() || 'standard') as any,
        loyaltyPoints: profile?.totalPoint ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicles,
      };

      setState({ user: authUser, walletBalance, isLoading: false, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof ApiError ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại';
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: message };
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    const { profile, walletBalance, vehicles } = await fetchProfileAndWallet(state.user.id);
    setState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        membershipId: profile?.tierName.toLowerCase() || prev.user.membershipId,
        membershipTier: (profile?.tierName.toLowerCase() || prev.user.membershipTier) as any,
        loyaltyPoints: profile?.totalPoint ?? prev.user.loyaltyPoints,
        vehicles,
      } : null,
      walletBalance,
    }));
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

  const logout = async () => {
    await authService.logout();
    setState({ user: null, walletBalance: 0, isLoading: false, isAuthenticated: false });
  };

  const addVehicle = async (licensePlate: string, vehicleTypeId: number, registrationPhotoUrl?: string, userNote?: string): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) return { success: false, error: 'Chưa đăng nhập' };

    try {
      const response = await vehicleService.addVehicle({ licensePlate, vehicleTypeId, registrationPhotoUrl, userNote });
      if (response.statusCode === 200 || response.statusCode === 201) {
        await refreshProfile();
        return { success: true };
      }
      return { success: false, error: response.message || 'Thêm xe thất bại' };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Đã xảy ra lỗi';
      return { success: false, error: message };
    }
  };

  const removeVehicle = async (licensePlate: string): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) return { success: false, error: 'Chưa đăng nhập' };

    try {
      const response = await vehicleService.deleteVehicle(licensePlate);
      if (response.statusCode === 200 || response.statusCode === 204) {
        await refreshProfile();
        return { success: true };
      }
      return { success: false, error: response.message || 'Xóa xe thất bại' };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Đã xảy ra lỗi';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshProfile,
        addVehicle,
        removeVehicle,
      }}
    >
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

/**
 * LuxeWash Theme - LuxeWash Bold Design System
 * Professional, clean design with gradient accents and modern shadows
 */

import { Platform } from 'react-native';

export const LuxeColors = {
  // Primary palette
  primary: '#006689',
  onPrimary: '#ffffff',
  primaryContainer: '#4aa9d7',
  onPrimaryContainer: '#003b51',
  inversePrimary: '#7ad1ff',
  surfaceTint: '#006689',

  // Surface colors
  surface: '#f7f9fb',
  surfaceBright: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  surfaceVariant: '#e0e3e5',

  // On colors
  onSurface: '#191c1e',
  onSurfaceVariant: '#3f484e',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',

  // Secondary
  secondary: '#545f73',
  onSecondary: '#ffffff',
  secondaryContainer: '#d5e0f8',
  onSecondaryContainer: '#586377',
  secondaryFixed: '#d8e3fb',
  secondaryFixedDim: '#bcc7de',
  onSecondaryFixed: '#111c2d',
  onSecondaryFixedVariant: '#3c475a',

  // Tertiary
  tertiary: '#006686',
  onTertiary: '#ffffff',
  tertiaryContainer: '#50a9d0',
  onTertiaryContainer: '#003b4f',
  tertiaryFixed: '#c0e8ff',
  tertiaryFixedDim: '#7bd1fa',
  onTertiaryFixed: '#001e2b',
  onTertiaryFixedVariant: '#004d66',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Outline
  outline: '#6f787f',
  outlineVariant: '#bec8cf',

  // Background
  background: '#f7f9fb',
  onBackground: '#191c1e',
} as const;

// Membership tier colors
export const MembershipColors = {
  standard: '#6f787f',
  silver: '#9CA3AF',
  gold: '#F59E0B',
  platinum: '#8B5CF6',
  diamond: '#06B6D4',
} as const;

export type MembershipTier = 'standard' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Membership benefits configuration
export const MembershipConfig: Record<MembershipTier, {
  name: string;
  nameVi: string;
  maxAdvanceDays: number;
  color: string;
  benefits: string[];
  discountRate: number;
  pointMultiplier: number;
}> = {
  standard: {
    name: 'Standard',
    nameVi: 'Standard',
    maxAdvanceDays: 7,
    color: MembershipColors.standard,
    benefits: ['Đặt lịch trước 7 ngày', 'Thanh toán ví'],
    discountRate: 0,
    pointMultiplier: 1,
  },
  silver: {
    name: 'Silver',
    nameVi: 'Bạc',
    maxAdvanceDays: 10,
    color: MembershipColors.silver,
    benefits: ['Đặt lịch trước 10 ngày', 'Ưu đãi 5%', 'Thanh toán ví'],
    discountRate: 0.05,
    pointMultiplier: 1.5,
  },
  gold: {
    name: 'Gold',
    nameVi: 'Vàng',
    maxAdvanceDays: 12,
    color: MembershipColors.gold,
    benefits: ['Đặt lịch trước 12 ngày', 'Ưu đãi 10%', 'Lối đi ưu tiên', 'Thanh toán ví'],
    discountRate: 0.10,
    pointMultiplier: 2,
  },
  platinum: {
    name: 'Platinum',
    nameVi: 'Bạch kim',
    maxAdvanceDays: 14,
    color: MembershipColors.platinum,
    benefits: ['Đặt lịch trước 14 ngày', 'Ưu đãi 15%', 'Làn riêng biệt', 'Ưu tiên cao nhất'],
    discountRate: 0.15,
    pointMultiplier: 3,
  },
  diamond: {
    name: 'Diamond',
    nameVi: 'Kim cương',
    maxAdvanceDays: 30,
    color: MembershipColors.diamond,
    benefits: ['Đặt lịch trước 30 ngày', 'Ưu đãi 20%', 'Làn riêng biệt', 'VIP support', 'Miễn phí phục vụ'],
    discountRate: 0.20,
    pointMultiplier: 4,
  },
};

export const LuxeFonts = Platform.select({
  ios: {
    headline: 'System',
    body: 'System',
    label: 'System',
  },
  default: {
    headline: 'Sora, sans-serif',
    body: 'Inter, sans-serif',
    label: 'Geist, sans-serif',
  },
  web: {
    headline: 'Sora, sans-serif',
    body: 'Inter, sans-serif',
    label: 'Geist, sans-serif',
  },
});

export const LuxeSpacing = {
  unit: 8,
  xs: 4,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 24,
  containerMargin: 20,
} as const;

export const LuxeBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Spacing helpers
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 480;

// Bold Design System - Gradients
export const LuxeGradients = {
  primary: ['#006689', '#4aa9d7'] as const,
  primaryLight: ['#4aa9d7', '#7ad1ff'] as const,
  dark: ['#003b51', '#006689'] as const,
  membershipCard: ['#006689', '#4aa9d7'] as const,
} as const;

// Bold Design System - Shadows (using brand colors)
export const LuxeShadows = {
  sm: {
    shadowColor: '#4aa9d7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#4aa9d7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4aa9d7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#4aa9d7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  primary: {
    shadowColor: '#4aa9d7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// Bold Design System - Typography scale
export const LuxeTypography = {
  // Headlines
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 26, fontWeight: '700' as const, lineHeight: 34 },
  h3: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  // Body
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  // Labels
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelBold: { fontSize: 14, fontWeight: '700' as const, lineHeight: 20 },
  // Caption
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  // Small
  sm: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
} as const;

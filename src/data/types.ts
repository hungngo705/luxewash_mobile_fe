/**
 * LuxeWash Data Types and Mock Data
 * Based on the ERD diagram
 */

// User Roles
export type UserRole = 'customer' | 'staff' | 'admin';

// Membership Types
export type MembershipTier = 'standard' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Membership {
  id: string;
  name: string;
  nameVi: string;
  tier: MembershipTier;
  discountRate: number;
  pointMultiplier: number;
  benefits: string[];
}

// User Types
export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  membershipId: string;
  membershipTier: MembershipTier;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// Staff Types
export interface Staff {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  role: 'receptionist' | 'washer' | 'supervisor' | 'manager';
  stationId: string;
  isActive: boolean;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  imageUrl?: string;
  userId: string;
  createdAt: Date;
}

// Service Types
export type ServiceCategory = 'basic' | 'premium' | 'deep_clean' | 'special';

export interface Service {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  price: number;
  duration: number; // in minutes
  imageUrl?: string;
  category: ServiceCategory;
  isActive: boolean;
}

// Station Types
export interface Station {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  openingHours: string;
  isActive: boolean;
}

export interface Lane {
  id: string;
  name: string;
  stationId: string;
  isPriority: boolean;
  isActive: boolean;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  serviceId: string;
  stationId: string;
  laneId?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: BookingStatus;
  subtotal: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  pointsDiscount: number;
  finalAmount: number;
  voucherId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  checkInTime?: Date;
  completedAt?: Date;
}

// Time Slot
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  period: 'morning' | 'afternoon' | 'evening';
  isAvailable: boolean;
}

// LPR (License Plate Recognition) Types
export interface LPRResult {
  plateNumber: string;
  confidence: number;
  timestamp: Date;
  imageUrl?: string;
}

export interface CheckInRecord {
  id: string;
  vehicleId: string;
  userId: string;
  bookingId?: string;
  licensePlate: string;
  membershipTier: MembershipTier;
  checkInTime: Date;
  queuePosition: number;
  assignedLaneId: string;
  isPriority: boolean;
  status: 'waiting' | 'in_service' | 'completed';
  recognizedImageUrl?: string;
}

// Queue Management
export interface QueueEntry {
  id: string;
  checkInRecordId: string;
  priority: number;
  estimatedWaitTime: number;
  createdAt: Date;
  status: 'waiting' | 'in_service' | 'completed';
}

// Voucher/Promotion Types
export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  userId?: string; // If assigned to specific user
}

// Payment Types
export type PaymentMethod = 'cash' | 'vnpay' | 'momo' | 'points';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
}

// Loyalty/Reward Types
export interface RewardHistory {
  id: string;
  userId: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  bookingId?: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'promotion' | 'loyalty' | 'system';
  isRead: boolean;
  createdAt: Date;
}

// Login credentials
export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

// Auth user (with auth info)
export interface AuthUser extends User {
  vehicles: Vehicle[];
}

// ============= MOCK DATA =============

// Membership configurations
export const mockMemberships: Membership[] = [
  {
    id: 'mem_standard',
    name: 'Standard',
    nameVi: 'Thành viên',
    tier: 'standard',
    discountRate: 0,
    pointMultiplier: 1,
    benefits: ['Tích điểm 1 điểm/1000đ'],
  },
  {
    id: 'mem_silver',
    name: 'Silver',
    nameVi: 'Bạc',
    tier: 'silver',
    discountRate: 0.05,
    pointMultiplier: 1.5,
    benefits: ['Giảm 5%', 'Tích điểm 1.5x'],
  },
  {
    id: 'mem_gold',
    name: 'Gold',
    nameVi: 'Vàng',
    tier: 'gold',
    discountRate: 0.10,
    pointMultiplier: 2,
    benefits: ['Giảm 10%', 'Tích điểm 2x', 'Ưu tiên'],
  },
  {
    id: 'mem_platinum',
    name: 'Platinum',
    nameVi: 'Bạch Kim',
    tier: 'platinum',
    discountRate: 0.15,
    pointMultiplier: 3,
    benefits: ['Giảm 15%', 'Tích điểm 3x', 'Làn VIP', 'Ưu tiên cao'],
  },
  {
    id: 'mem_diamond',
    name: 'Diamond',
    nameVi: 'Kim Cương',
    tier: 'diamond',
    discountRate: 0.20,
    pointMultiplier: 4,
    benefits: ['Giảm 20%', 'Tích điểm 4x', 'Làn VIP', 'Ưu tiên cao nhất', 'Dịch vụ đặc biệt'],
  },
];

// Mock users (customers)
export const mockUsers: User[] = [
  {
    id: 'user_001',
    phoneNumber: '0909123456',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@email.com',
    role: 'customer',
    membershipId: 'mem_gold',
    membershipTier: 'gold',
    loyaltyPoints: 2450,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user_002',
    phoneNumber: '0912345678',
    name: 'Trần Thị Lan',
    email: 'lan.tran@email.com',
    role: 'customer',
    membershipId: 'mem_platinum',
    membershipTier: 'platinum',
    loyaltyPoints: 8500,
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user_003',
    phoneNumber: '0934567890',
    name: 'Lê Hoàng Nam',
    role: 'customer',
    membershipId: 'mem_standard',
    membershipTier: 'standard',
    loyaltyPoints: 500,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

// Mock staff
export const mockStaff: Staff[] = [
  {
    id: 'staff_001',
    userId: 'staff_user_001',
    name: 'Nguyễn Văn An',
    phoneNumber: '0987654321',
    role: 'receptionist',
    stationId: 'stn_001',
    isActive: true,
  },
  {
    id: 'staff_002',
    userId: 'staff_user_002',
    name: 'Phạm Thị Hương',
    phoneNumber: '0976543210',
    role: 'supervisor',
    stationId: 'stn_001',
    isActive: true,
  },
  {
    id: 'staff_003',
    userId: 'staff_user_003',
    name: 'Trần Văn Tùng',
    phoneNumber: '0965432109',
    role: 'manager',
    stationId: 'stn_002',
    isActive: true,
  },
];

// Staff users for login
export const mockStaffUsers: User[] = [
  {
    id: 'staff_user_001',
    phoneNumber: 'staff001',
    name: 'Nguyễn Văn An',
    role: 'staff',
    membershipId: '',
    membershipTier: 'standard',
    loyaltyPoints: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'staff_user_002',
    phoneNumber: 'staff002',
    name: 'Phạm Thị Hương',
    role: 'staff',
    membershipId: '',
    membershipTier: 'standard',
    loyaltyPoints: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'staff_user_003',
    phoneNumber: 'staff003',
    name: 'Trần Văn Tùng',
    role: 'staff',
    membershipId: '',
    membershipTier: 'standard',
    loyaltyPoints: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'veh_001',
    licensePlate: '30A-888.88',
    brand: 'Mercedes-Benz',
    model: 'S500',
    color: 'Đen',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
    userId: 'user_001',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 'veh_002',
    licensePlate: '51F-999.99',
    brand: 'Porsche',
    model: 'Taycan',
    color: 'Đỏ',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=400',
    userId: 'user_001',
    createdAt: new Date('2023-03-20'),
  },
  {
    id: 'veh_003',
    licensePlate: '30G-777.77',
    brand: 'BMW',
    model: 'X7',
    color: 'Xám',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    userId: 'user_001',
    createdAt: new Date('2023-06-10'),
  },
  {
    id: 'veh_004',
    licensePlate: '29A-111.11',
    brand: 'Lexus',
    model: 'LS500',
    color: 'Trắng',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    userId: 'user_002',
    createdAt: new Date('2022-06-20'),
  },
  {
    id: 'veh_005',
    licensePlate: '60A-222.22',
    brand: 'Honda',
    model: 'Civic',
    color: 'Xanh',
    imageUrl: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
    userId: 'user_003',
    createdAt: new Date('2024-03-01'),
  },
];

// Mock services
export const mockServices: Service[] = [
  {
    id: 'svc_001',
    name: 'Standard Wash',
    nameVi: 'Rửa xe tiêu chuẩn',
    description: 'Exterior wash and basic interior cleaning',
    descriptionVi: 'Rửa ngoài xe, lau khô, dọn nội thất cơ bản',
    price: 150000,
    duration: 30,
    category: 'basic',
    isActive: true,
  },
  {
    id: 'svc_002',
    name: 'Premium Wash',
    nameVi: 'Rửa xe cao cấp',
    description: 'Exterior wash with wax protection and detailed interior',
    descriptionVi: 'Rửa ngoài + phủ sáp bảo vệ, dọn nội thất chi tiết',
    price: 300000,
    duration: 45,
    category: 'premium',
    isActive: true,
  },
  {
    id: 'svc_003',
    name: 'Deep Clean',
    nameVi: 'Vệ sinh chuyên sâu',
    description: 'Vacuum, surface wipe, leather/fabric care, odor removal',
    descriptionVi: 'Hút bụi, lau bề mặt, vệ sinh da/nỉ, khử mùi',
    price: 500000,
    duration: 60,
    category: 'deep_clean',
    isActive: true,
  },
  {
    id: 'svc_004',
    name: 'Ceramic Coating',
    nameVi: 'Phủ Ceramic',
    description: 'Ceramic coating for paint protection',
    descriptionVi: 'Phủ bóng ceramic bảo vệ sơn xe',
    price: 1000000,
    duration: 120,
    category: 'special',
    isActive: true,
  },
];

// Mock stations
export const mockStations: Station[] = [
  {
    id: 'stn_001',
    name: 'LuxeWash Quận 1',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    phoneNumber: '028 1234 5678',
    openingHours: '7:00 - 20:00',
    isActive: true,
  },
  {
    id: 'stn_002',
    name: 'LuxeWash Quận 7',
    address: '456 Đường Nguyễn Thị Thập, Quận 7, TP.HCM',
    phoneNumber: '028 7654 3210',
    openingHours: '7:00 - 20:00',
    isActive: true,
  },
];

// Mock lanes
export const mockLanes: Lane[] = [
  { id: 'lane_001', name: 'Làn 1', stationId: 'stn_001', isPriority: false, isActive: true },
  { id: 'lane_002', name: 'Làn 2', stationId: 'stn_001', isPriority: false, isActive: true },
  { id: 'lane_003', name: 'Làn VIP', stationId: 'stn_001', isPriority: true, isActive: true },
  { id: 'lane_004', name: 'Làn 1', stationId: 'stn_002', isPriority: false, isActive: true },
  { id: 'lane_005', name: 'Làn VIP', stationId: 'stn_002', isPriority: true, isActive: true },
];

// Mock bookings
export const mockBookings: Booking[] = [
  {
    id: 'book_001',
    userId: 'user_001',
    vehicleId: 'veh_001',
    serviceId: 'svc_002',
    stationId: 'stn_001',
    scheduledDate: '2024-12-26',
    scheduledTime: '09:00',
    status: 'confirmed',
    subtotal: 300000,
    discountAmount: 30000,
    loyaltyPointsUsed: 0,
    pointsDiscount: 0,
    finalAmount: 270000,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: 'book_002',
    userId: 'user_001',
    vehicleId: 'veh_002',
    serviceId: 'svc_003',
    stationId: 'stn_001',
    scheduledDate: '2024-12-22',
    scheduledTime: '14:00',
    status: 'completed',
    subtotal: 500000,
    discountAmount: 50000,
    loyaltyPointsUsed: 20000,
    pointsDiscount: 20000,
    finalAmount: 430000,
    checkInTime: new Date('2024-12-22T14:05'),
    completedAt: new Date('2024-12-22T15:30'),
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-22'),
  },
  {
    id: 'book_003',
    userId: 'user_001',
    vehicleId: 'veh_001',
    serviceId: 'svc_001',
    stationId: 'stn_001',
    scheduledDate: '2024-12-15',
    scheduledTime: '10:30',
    status: 'completed',
    subtotal: 150000,
    discountAmount: 0,
    loyaltyPointsUsed: 0,
    pointsDiscount: 0,
    finalAmount: 150000,
    checkInTime: new Date('2024-12-15T10:25'),
    completedAt: new Date('2024-12-15T11:00'),
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-15'),
  },
];

// Generate time slots for a day
export function generateTimeSlots(stationId: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 7;
  const endHour = 20;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endMinute = minute + 30;
      const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour;
      const endMinuteAdjusted = endMinute >= 60 ? 0 : endMinute;
      const endTime = `${endHourAdjusted.toString().padStart(2, '0')}:${endMinuteAdjusted.toString().padStart(2, '0')}`;

      const period: 'morning' | 'afternoon' | 'evening' =
        hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      slots.push({
        id: `slot_${stationId}_${hour}_${minute}`,
        startTime,
        endTime,
        period,
        isAvailable: Math.random() > 0.3,
      });
    }
  }

  return slots;
}

// Mock vouchers
export const mockVouchers: Voucher[] = [
  {
    id: 'vch_001',
    code: 'KHAITRUONG50',
    title: 'Ưu đãi Khai trương',
    description: 'Giảm 50% cho lần đầu sử dụng dịch vụ',
    discountType: 'percentage',
    discountValue: 50,
    minOrderAmount: 0,
    maxDiscount: 150000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2026-12-31'),
    isActive: true,
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'vch_002',
    code: 'GIAM20K',
    title: 'Voucher Giáng sinh',
    description: 'Đồng giá 99k cho gói vệ sinh nội thất',
    discountType: 'fixed',
    discountValue: 99000,
    minOrderAmount: 200000,
    maxDiscount: 99000,
    validFrom: new Date('2024-12-01'),
    validUntil: new Date('2026-12-25'),
    isActive: true,
    usedCount: 0,
  },
];

// Mock check-in records
export const mockCheckInRecords: CheckInRecord[] = [
  {
    id: 'checkin_001',
    vehicleId: 'veh_001',
    userId: 'user_001',
    licensePlate: '30A-888.88',
    membershipTier: 'gold',
    checkInTime: new Date(),
    queuePosition: 2,
    assignedLaneId: 'lane_001',
    isPriority: false,
    status: 'waiting',
  },
  {
    id: 'checkin_002',
    vehicleId: 'veh_004',
    userId: 'user_002',
    licensePlate: '29A-111.11',
    membershipTier: 'platinum',
    checkInTime: new Date(),
    queuePosition: 1,
    assignedLaneId: 'lane_003',
    isPriority: true,
    status: 'in_service',
  },
  {
    id: 'checkin_003',
    vehicleId: 'veh_005',
    userId: 'user_003',
    licensePlate: '60A-222.22',
    membershipTier: 'standard',
    checkInTime: new Date(),
    queuePosition: 3,
    assignedLaneId: 'lane_002',
    isPriority: false,
    status: 'waiting',
  },
];

// Mock reward history
export const mockRewardHistory: RewardHistory[] = [
  {
    id: 'rew_001',
    userId: 'user_001',
    type: 'earn',
    points: 500,
    description: 'Đặt lịch rửa xe Premium',
    bookingId: 'book_002',
    createdAt: new Date('2024-12-22'),
  },
  {
    id: 'rew_002',
    userId: 'user_001',
    type: 'redeem',
    points: 20000,
    description: 'Đổi điểm thưởng',
    bookingId: 'book_002',
    createdAt: new Date('2024-12-22'),
  },
  {
    id: 'rew_003',
    userId: 'user_001',
    type: 'earn',
    points: 150,
    description: 'Đặt lịch rửa xe Standard',
    bookingId: 'book_003',
    createdAt: new Date('2024-12-15'),
  },
];

// Helper functions
export function getPriorityScore(tier: MembershipTier): number {
  const scores: Record<MembershipTier, number> = {
    standard: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
  };
  return scores[tier];
}

export function calculateQueuePosition(tier: MembershipTier, currentQueueLength: number): number {
  if (tier === 'platinum' || tier === 'diamond') {
    return 1;
  }
  return currentQueueLength + getPriorityScore(tier);
}

export function getMembershipByTier(tier: MembershipTier): Membership | undefined {
  return mockMemberships.find(m => m.tier === tier);
}

export function getVehiclesByUserId(userId: string): Vehicle[] {
  return mockVehicles.filter(v => v.userId === userId);
}

export function getBookingsByUserId(userId: string): Booking[] {
  return mockBookings.filter(b => b.userId === userId);
}

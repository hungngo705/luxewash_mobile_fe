/**
 * Home Screen - LuxeWash Trang chủ
 * Shows current vehicle, promotions, and quick booking
 * Redirects to login if not authenticated
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockUsers,
  mockVehicles,
  mockVouchers,
  mockServices,
  Vehicle,
  Voucher,
} from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Use auth user or mock data
  const currentUser = user || mockUsers[0];
  const vehicles = user?.vehicles?.length ? user.vehicles : mockVehicles;
  const currentVehicle = vehicles[0];
  const membershipInfo = MembershipConfig[currentUser?.membershipTier || 'standard'];

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hôm nay';
    if (diff === 1) return 'Hôm qua';
    if (diff < 7) return `${diff} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleBooking = () => {
    router.push('/booking/select-vehicle');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Xin chào!</Text>
              <Text style={styles.userName}>{currentUser.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push('/notifications' as any)}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Membership Card */}
          <View style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <View>
                <Text style={styles.membershipLabel}>{membershipInfo.nameVi}</Text>
                <Text style={styles.membershipName}>{membershipInfo.name}</Text>
              </View>
              <View style={[styles.membershipBadge, { backgroundColor: membershipInfo.color }]}>
                <Text style={styles.membershipBadgeText}>
                  {currentUser.loyaltyPoints.toLocaleString()} điểm
                </Text>
              </View>
            </View>
            <View style={styles.membershipProgress}>
              <View style={styles.membershipProgressBar}>
                <View
                  style={[
                    styles.membershipProgressFill,
                    { width: '60%', backgroundColor: membershipInfo.color },
                  ]}
                />
              </View>
              <Text style={styles.membershipProgressText}>
                Còn 500 điểm để lên hạng Kim Cương
              </Text>
            </View>
          </View>

          {/* Current Vehicle Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương tiện hiện tại</Text>
            <View style={styles.currentVehicleCard}>
              <Image
                source={{ uri: currentVehicle.imageUrl || 'https://via.placeholder.com/80' }}
                style={styles.vehicleImage}
              />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{currentVehicle.brand} {currentVehicle.model}</Text>
                <Text style={styles.vehiclePlate}>{currentVehicle.licensePlate}</Text>
                <View style={styles.vehicleBadge}>
                  <Text style={styles.vehicleBadgeText}>{membershipInfo.nameVi} Member</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.chevronBtn}>
                <Text style={styles.chevronIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle Selector */}
          {vehicles.length > 1 && (
            <View style={styles.vehicleSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity key={vehicle.id} style={styles.vehicleSelectorItem}>
                    <Image
                      source={{ uri: vehicle.imageUrl || 'https://via.placeholder.com/60' }}
                      style={styles.vehicleSelectorImage}
                    />
                    <Text style={styles.vehicleSelectorPlate} numberOfLines={1}>
                      {vehicle.licensePlate}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleBooking}>
                <View style={[styles.quickActionIcon, { backgroundColor: LuxeColors.primaryContainer + '30' }]}>
                  <Text style={styles.quickActionEmoji}>📅</Text>
                </View>
                <Text style={styles.quickActionText}>Đặt lịch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={styles.quickActionEmoji}>📍</Text>
                </View>
                <Text style={styles.quickActionText}>Chi nhánh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={styles.quickActionEmoji}>📞</Text>
                </View>
                <Text style={styles.quickActionText}>Hỗ trợ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Text style={styles.quickActionEmoji}>📖</Text>
                </View>
                <Text style={styles.quickActionText}>Hướng dẫn</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Booking Button */}
          <View style={styles.bookingSection}>
            <TouchableOpacity style={styles.bookingBtn} onPress={handleBooking}>
              <Text style={styles.bookingIcon}>✨</Text>
              <Text style={styles.bookingText}>Đặt lịch hẹn ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Services Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dịch vụ</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mockServices.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceIconContainer}>
                    <Text style={styles.serviceIcon}>
                      {service.category === 'basic' ? '🚿' : service.category === 'premium' ? '✨' : service.category === 'deep_clean' ? '🧹' : '💎'}
                    </Text>
                  </View>
                  <Text style={styles.serviceName}>{service.nameVi}</Text>
                  <Text style={styles.servicePrice}>{service.price.toLocaleString('vi-VN')}đ</Text>
                  <Text style={styles.serviceDuration}>{service.duration} phút</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Promotions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khuyến mãi</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoCards}>
              {mockVouchers.slice(0, 2).map((voucher) => (
                <View key={voucher.id} style={styles.promoCard}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>
                      {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                    </Text>
                  </View>
                  <Text style={styles.promoTitle}>{voucher.title}</Text>
                  <Text style={styles.promoDesc}>{voucher.description}</Text>
                  <Text style={styles.promoCode}>{voucher.code}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>Tổng lần rửa</Text>
                <Text style={styles.statValue}>24</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statLabel}>Đã chi tiêu</Text>
                <Text style={styles.statValue}>12.5M</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
                <Text style={styles.statValue}>4.9</Text>
              </View>
            </View>
          </View>

          {/* Bottom padding for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '20',
  },
  greeting: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LuxeColors.surfaceContainer,
    borderRadius: 22,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  membershipCard: {
    margin: LuxeSpacing.lg,
    padding: LuxeSpacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.xl,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LuxeSpacing.md,
  },
  membershipLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  membershipName: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  membershipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  membershipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  membershipProgress: {
    gap: 8,
  },
  membershipProgressBar: {
    height: 6,
    backgroundColor: LuxeColors.surfaceContainer,
    borderRadius: 3,
  },
  membershipProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  membershipProgressText: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  section: {
    paddingHorizontal: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.sm,
  },
  seeAllText: {
    fontSize: 13,
    color: LuxeColors.primaryContainer,
    fontWeight: '500',
  },
  currentVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: LuxeColors.surfaceContainer,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: LuxeSpacing.md,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  vehiclePlate: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  vehicleBadge: {
    backgroundColor: LuxeColors.primaryContainer + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  vehicleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    fontSize: 24,
    color: LuxeColors.onSurfaceVariant,
  },
  vehicleSelector: {
    paddingLeft: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.md,
  },
  vehicleSelectorItem: {
    alignItems: 'center',
    marginRight: LuxeSpacing.md,
    opacity: 0.7,
  },
  vehicleSelectorImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: LuxeColors.surfaceContainer,
  },
  vehicleSelectorPlate: {
    fontSize: 10,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
    maxWidth: 60,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionText: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  bookingSection: {
    paddingHorizontal: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.lg,
  },
  bookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: LuxeColors.primaryContainer,
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bookingIcon: {
    fontSize: 20,
  },
  bookingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  serviceCard: {
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginRight: LuxeSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LuxeColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 22,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    textAlign: 'center',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    marginTop: 4,
  },
  serviceDuration: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  promoCards: {
    flexDirection: 'row',
    gap: LuxeSpacing.md,
  },
  promoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  promoBadge: {
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  promoDesc: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  promoCode: {
    fontSize: 11,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
    marginTop: 8,
    backgroundColor: LuxeColors.primaryContainer + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: LuxeSpacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
});

/**
 * Home Screen - LuxeWash Trang chủ
 * Shows current vehicle, promotions, and quick booking
 * Redirects to login if not authenticated
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/api';
import { mockVouchers, mockServices } from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, walletBalance, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Array<{ serviceId: number; serviceName: string; description: string; prices: Array<{ vehicleTypeId: number; vehicleTypeName: string; price: number }> }>>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const currentUser = user;
  const vehicles = user?.vehicles || [];
  const membershipInfo = currentUser ? MembershipConfig[currentUser.membershipTier] : MembershipConfig.standard;

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const res = await bookingService.getServices();
        if (res.statusCode === 200 && res.data) {
          setServices(res.data);
        }
      } catch (e) {
        console.error('Failed to load services:', e);
      }
      setLoadingServices(false);
    };
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const getLowestPrice = (service: typeof services[0]) => {
    if (!service.prices || service.prices.length === 0) return 0;
    return Math.min(...service.prices.map(p => p.price));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hôm nay';
    if (diff === 1) return 'Hôm qua';
    if (diff < 7) return `${diff} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleBooking = () => {
    router.push('/booking/select-vehicles');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Xin chào!</Text>
              <Text style={styles.userName}>{currentUser?.name || 'Khách'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push('/notifications' as any)}
            >
              <Feather name="bell" size={24} color={LuxeColors.primaryContainer} />
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
                  {`${currentUser?.loyaltyPoints?.toLocaleString() || '0'} điểm`}
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
                Số dư: {walletBalance.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>

          {/* Vehicle List */}
          {vehicles.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Phương tiện</Text>
                <TouchableOpacity onPress={() => router.push('/vehicles')}>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleScrollContent}>
                {vehicles.map((vehicle, idx) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[styles.vehicleCard, idx === 0 && styles.vehicleCardFirst]}
                    onPress={() => router.push('/vehicles')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.vehicleCardImage}>
                      {vehicle.imageUrl ? (
                        <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleCardImg} resizeMode="cover" />
                      ) : (
                        <View style={styles.vehicleCardImgPlaceholder}>
                          <Feather name="truck" size={24} color={LuxeColors.onSurfaceVariant} />
                        </View>
                      )}
                    </View>
                    <View style={styles.vehicleCardInfo}>
                      <Text style={styles.vehicleCardModel} numberOfLines={1}>
                      {vehicle.model || vehicle.brand || 'Phương tiện'}
                    </Text>
                      {vehicle.model && vehicle.brand ? (
                        <Text style={styles.vehicleCardBrand} numberOfLines={1}>{vehicle.brand}</Text>
                      ) : null}
                      <View style={styles.vehicleCardPlate}>
                        <Text style={styles.vehicleCardPlateText}>{vehicle.licensePlate}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Phương tiện</Text>
              </View>
              <TouchableOpacity style={styles.emptyVehicleCard} onPress={() => router.push('/vehicles/add-vehicle')}>
                <View style={styles.emptyVehicleIconWrap}>
                  <Feather name="plus-circle" size={36} color={LuxeColors.primaryContainer} />
                </View>
                <View style={styles.emptyVehicleText}>
                  <Text style={styles.emptyVehicleTitle}>Thêm phương tiện</Text>
                  <Text style={styles.emptyVehicleSubtitle}>Đăng ký xe để đặt lịch rửa xe nhanh hơn</Text>
                </View>
                <Feather name="chevron-right" size={20} color={LuxeColors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleBooking}>
                <View style={[styles.quickActionIcon, { backgroundColor: LuxeColors.primaryContainer + '30' }]}>
                  <Feather name="calendar" size={20} color={LuxeColors.primaryContainer} />
                </View>
                <Text style={styles.quickActionText}>Đặt lịch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Feather name="map-pin" size={20} color="#2E7D32" />
                </View>
                <Text style={styles.quickActionText}>Chi nhánh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Feather name="phone" size={20} color="#E65100" />
                </View>
                <Text style={styles.quickActionText}>Hỗ trợ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Feather name="book-open" size={20} color="#7B1FA2" />
                </View>
                <Text style={styles.quickActionText}>Hướng dẫn</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Booking Button */}
          <View style={styles.bookingSection}>
            <TouchableOpacity style={styles.bookingBtn} onPress={handleBooking}>
              <Feather name="star" size={20} color="#ffffff" />
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
              {(services.length > 0 ? services : mockServices).map((service: any) => {
                const price = services.length > 0 ? getLowestPrice(service) : service.price;
                const cat = services.length > 0 ? 'basic' : service.category;
                return (
                  <View key={services.length > 0 ? service.serviceId : service.id} style={styles.serviceCard}>
                    <View style={styles.serviceIconContainer}>
                      <Feather
                        name={cat === 'basic' ? 'droplet' : cat === 'premium' ? 'star' : cat === 'deep_clean' ? 'sun' : 'award'}
                        size={24}
                        color={LuxeColors.primaryContainer}
                      />
                    </View>
                    <Text style={styles.serviceName}>
                      {services.length > 0 ? service.serviceName : service.nameVi}
                    </Text>
                    <Text style={styles.servicePrice}>{price.toLocaleString('vi-VN')}đ</Text>
                  </View>
                );
              })}
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
                      {voucher.discountType === 'percentage' ? `${voucher.discountAmount}%` : `${voucher.discountAmount.toLocaleString('vi-VN')}đ`}
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
                <Feather name="bar-chart-2" size={20} color={LuxeColors.primaryContainer} />
                <Text style={styles.statLabel}>Tổng lần rửa</Text>
                <Text style={styles.statValue}>{vehicles.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="dollar-sign" size={20} color={LuxeColors.primaryContainer} />
                <Text style={styles.statLabel}>Số dư ví</Text>
                <Text style={styles.statValue}>{walletBalance > 0 ? `${(walletBalance / 1000000).toFixed(1)}M` : '0đ'}</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="star" size={20} color={LuxeColors.primaryContainer} />
                <Text style={styles.statLabel}>Điểm</Text>
                <Text style={styles.statValue}>{currentUser?.loyaltyPoints || 0}</Text>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.sm,
  },
  vehicleScrollContent: {
    paddingRight: LuxeSpacing.lg,
  },
  vehicleCard: {
    width: 150,
    marginRight: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: LuxeBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  vehicleCardFirst: {
    marginLeft: LuxeSpacing.lg,
  },
  vehicleCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: LuxeColors.surfaceContainerHighest,
  },
  vehicleCardImg: {
    width: '100%',
    height: '100%',
  },
  vehicleCardImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCardInfo: {
    padding: 10,
  },
  vehicleCardModel: {
    fontSize: 14,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  vehicleCardBrand: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 6,
  },
  vehicleCardPlate: {
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  vehicleCardPlateText: {
    fontSize: 11,
    fontWeight: '800',
    color: LuxeColors.primaryContainer,
  },
  emptyVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: LuxeBorderRadius.xl,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: LuxeColors.primaryContainer + '50',
  },
  emptyVehicleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: LuxeColors.primaryContainer + '15',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyVehicleText: {
    flex: 1,
    marginLeft: 12,
  },
  emptyVehicleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  emptyVehicleSubtitle: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
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

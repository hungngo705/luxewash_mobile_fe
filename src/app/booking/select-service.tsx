/**
 * Advance Booking Flow - Step 2: Select Service
 * Bold professional redesign with solid white cards
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, LuxeShadows, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type Service } from '@/services/api';
import { Header } from '@/components/ui/Header';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { BottomActionBar } from '@/components/ui/BottomActionBar';

const getServiceIconName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('premium') || n.includes('cao cấp')) return 'star';
  if (n.includes('deep') || n.includes('ve sinh') || n.includes('sâu') || n.includes('nội thất')) return 'sun';
  if (n.includes('ceramic') || n.includes('đặc biệt') || n.includes('special')) return 'star';
  if (n.includes('quick') || n.includes('nhanh')) return 'zap';
  return 'droplet';
};

export default function SelectServiceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const vehicleIdParam = (params.vehicleId as string) || '';
  const vehicleTypeIdParam = parseInt(params.vehicleTypeId as string) || 1;
  const vehicleBrandParam = (params.vehicleBrand as string) || '';
  const branchIdParam = parseInt(params.branchId as string) || 1;
  const branchNameParam = (params.branchName as string) || 'LuxeWash';

  const membershipInfo = user ? MembershipConfig[user.membershipTier] : MembershipConfig.standard;
  const membershipDiscount = membershipInfo.discountRate;

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getServices();
        if (res.statusCode === 200 && res.data) {
          setServices(res.data);
        }
      } catch (e) {
        console.error('Failed to load services:', e);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const getPriceForVehicleType = (service: Service): number => {
    if (!service.prices || service.prices.length === 0) return 0;
    const priceForType = service.prices.find(p => p.vehicleTypeId === vehicleTypeIdParam);
    if (priceForType) return priceForType.price;
    return Math.min(...service.prices.map(p => p.price));
  };

  const handleContinue = () => {
    if (!selectedService) return;
    const price = getPriceForVehicleType(selectedService);
    router.push({
      pathname: '/booking/select-date',
      params: {
        serviceId: String(selectedService.serviceId),
        serviceName: selectedService.serviceName,
        servicePrice: String(price),
        membershipDiscount: String(membershipDiscount),
        vehicleId: vehicleIdParam,
        vehicleTypeId: String(vehicleTypeIdParam),
        vehicleBrand: vehicleBrandParam,
        branchId: String(branchIdParam),
        branchName: branchNameParam,
      },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Đặt lịch rửa xe" onBack={() => router.back()} />

        <ProgressSteps
          steps={[
            { label: 'Chi nhánh' },
            { label: 'Xe' },
            { label: 'Dịch vụ' },
            { label: 'Ngày' },
            { label: 'Xác nhận' },
          ]}
          currentStep={2}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Vehicle Summary */}
          <View style={styles.vehicleSummary}>
            <View style={styles.vehicleSummaryIcon}>
              <Feather name="truck" size={18} color={LuxeColors.primaryContainer} />
            </View>
            <View style={styles.vehicleSummaryContent}>
              <Text style={styles.vehicleSummaryTitle}>{vehicleBrandParam}</Text>
              <Text style={styles.vehicleSummarySubtitle} numberOfLines={1}>{vehicleIdParam}</Text>
            </View>
          </View>

          {/* Branch Summary */}
          <View style={styles.branchSummary}>
            <View style={styles.branchSummaryIcon}>
              <Feather name="map-pin" size={18} color={LuxeColors.primaryContainer} />
            </View>
            <View style={styles.branchSummaryContent}>
              <Text style={styles.branchSummaryTitle}>{branchNameParam}</Text>
            </View>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Chọn dịch vụ</Text>
            <Text style={styles.welcomeSubtitle}>
              {membershipDiscount > 0
                ? `Bạn được giảm ${Math.round(membershipDiscount * 100)}% cho mọi dịch vụ!`
                : 'Chọn dịch vụ phù hợp với nhu cầu của bạn'}
            </Text>
          </View>

          {/* Services */}
          <View style={styles.servicesSection}>
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
                <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
              </View>
            ) : services.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="droplet" size={48} color={LuxeColors.outlineVariant} />
                <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
              </View>
            ) : (
              services.map((service) => {
                const isSelected = selectedService?.serviceId === service.serviceId;
                const basePrice = getPriceForVehicleType(service);
                const discountedPrice = Math.round(basePrice * (1 - membershipDiscount));
                const iconName = getServiceIconName(service.serviceName);

                return (
                  <TouchableOpacity
                    key={service.serviceId}
                    style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                    onPress={() => setSelectedService(service)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    )}

                    <View style={styles.serviceIconWrap}>
                      <Feather
                        name={iconName as any}
                        size={28}
                        color={isSelected ? LuxeColors.primaryContainer : LuxeColors.onSurfaceVariant}
                      />
                    </View>

                    <View style={styles.serviceContent}>
                      <Text style={styles.serviceName}>{service.serviceName}</Text>
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {service.description || 'Dịch vụ rửa xe chuyên nghiệp'}
                      </Text>
                      {membershipDiscount > 0 && (
                        <View style={styles.discountBadge}>
                          <Feather name="tag" size={11} color={LuxeColors.primaryContainer} />
                          <Text style={styles.discountBadgeText}>Giảm {Math.round(membershipDiscount * 100)}%</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.servicePriceWrap}>
                      {membershipDiscount > 0 && (
                        <Text style={styles.originalPrice}>{basePrice.toLocaleString('vi-VN')}đ</Text>
                      )}
                      <Text style={[styles.servicePrice, membershipDiscount > 0 && styles.servicePriceDiscounted]}>
                        {discountedPrice.toLocaleString('vi-VN')}đ
                      </Text>
                      <Text style={styles.priceNote}>/xe</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Membership Card */}
          {membershipDiscount > 0 && (
            <View style={styles.membershipCard}>
              <View style={styles.membershipIconWrap}>
                <Feather name="star" size={22} color={LuxeColors.primaryContainer} />
              </View>
              <View style={styles.membershipContent}>
                <Text style={styles.membershipTitle}>Ưu đãi {membershipInfo.nameVi}</Text>
                <Text style={styles.membershipDesc}>
                  Giảm {Math.round(membershipDiscount * 100)}% cho tất cả dịch vụ
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        <BottomActionBar
          title="TIẾP THEO"
          onPress={handleContinue}
          disabled={!selectedService}
          icon="arrow-right"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  vehicleSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    ...LuxeShadows.sm,
  },
  vehicleSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleSummaryContent: { flex: 1 },
  vehicleSummaryTitle: { fontSize: 14, fontWeight: '700', color: LuxeColors.onSurface },
  vehicleSummarySubtitle: { fontSize: 12, color: LuxeColors.onSurfaceVariant, marginTop: 2 },
  branchSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    ...LuxeShadows.sm,
  },
  branchSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchSummaryContent: { flex: 1 },
  branchSummaryTitle: { fontSize: 14, fontWeight: '700', color: LuxeColors.onSurface },
  welcomeSection: { marginBottom: 16 },
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: LuxeColors.onSurface, marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: LuxeColors.onSurfaceVariant, lineHeight: 20 },
  servicesSection: { gap: 12 },
  loadingState: { alignItems: 'center', padding: 40, gap: 12 },
  loadingText: { fontSize: 14, color: LuxeColors.onSurfaceVariant },
  emptyState: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 16, color: LuxeColors.onSurfaceVariant },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...LuxeShadows.sm,
  },
  serviceCardSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '06',
    ...LuxeShadows.md,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: LuxeColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContent: { flex: 1, marginLeft: 14 },
  serviceName: { fontSize: 16, fontWeight: '700', color: LuxeColors.onSurface, marginBottom: 4 },
  serviceDesc: { fontSize: 13, color: LuxeColors.onSurfaceVariant, lineHeight: 18, marginBottom: 8 },
  discountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: LuxeColors.primaryContainer + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  discountBadgeText: { fontSize: 11, fontWeight: '700', color: LuxeColors.primaryContainer },
  servicePriceWrap: { alignItems: 'flex-end', justifyContent: 'center' },
  originalPrice: { fontSize: 12, color: LuxeColors.outline, textDecorationLine: 'line-through' },
  servicePrice: { fontSize: 18, fontWeight: '800', color: LuxeColors.onSurface },
  servicePriceDiscounted: { color: LuxeColors.primaryContainer },
  priceNote: { fontSize: 11, color: LuxeColors.onSurfaceVariant },
  membershipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: LuxeColors.primaryContainer + '12', borderRadius: 16, padding: 16, gap: 14, marginTop: 16, borderWidth: 1, borderColor: LuxeColors.primaryContainer + '25' },
  membershipIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  membershipContent: { flex: 1 },
  membershipTitle: { fontSize: 15, fontWeight: '700', color: LuxeColors.onSurface, marginBottom: 2 },
  membershipDesc: { fontSize: 13, color: LuxeColors.onSurfaceVariant },
});

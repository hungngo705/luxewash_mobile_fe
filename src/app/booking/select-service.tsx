/**
 * Advance Booking Flow - Step 1: Select Service
 * User selects a wash service first
 * Next: select-date.tsx to pick date + time
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type Service } from '@/services/api';

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

  const getMinPrice = (service: Service): number => {
    if (!service.prices || service.prices.length === 0) return 0;
    return Math.min(...service.prices.map(p => p.price));
  };

  const handleContinue = () => {
    if (!selectedService) return;
    const minPrice = getMinPrice(selectedService);
    router.push({
      pathname: '/booking/select-date',
      params: {
        serviceId: String(selectedService.serviceId),
        serviceName: selectedService.serviceName,
        servicePrice: String(minPrice),
        membershipDiscount: String(membershipDiscount),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch rửa xe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Chọn dịch vụ</Text>
          <Text style={styles.welcomeSubtitle}>
            {membershipDiscount > 0
              ? `Bạn được giảm ${Math.round(membershipDiscount * 100)}% cho mọi dịch vụ!`
              : 'Chọn dịch vụ phù hợp với nhu cầu của bạn'}
          </Text>
        </View>

        {/* Services list */}
        <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
              <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚿</Text>
              <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
            </View>
          ) : (
            services.map((service) => {
              const isSelected = selectedService?.serviceId === service.serviceId;
              const basePrice = getMinPrice(service);
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
                      <Feather name="check" size={12} color="#ffffff" />
                    </View>
                  )}

                  <View style={styles.serviceImageContainer}>
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
                    <View style={styles.serviceMeta}>
                      {membershipDiscount > 0 && (
                        <Text style={styles.serviceDiscount}>
                          Giảm {Math.round(membershipDiscount * 100)}%
                        </Text>
                      )}
                      {service.prices && service.prices.length > 1 && (
                        <Text style={styles.serviceNote}>
                          {service.prices.length} gói giá
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.servicePriceContainer}>
                    {membershipDiscount > 0 && (
                      <Text style={styles.originalPrice}>
                        {basePrice.toLocaleString('vi-VN')}đ
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.servicePrice,
                        membershipDiscount > 0 && styles.servicePriceDiscounted,
                      ]}
                    >
                      {discountedPrice.toLocaleString('vi-VN')}đ
                    </Text>
                    <Text style={styles.priceNote}>/xe</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Membership card */}
        {membershipDiscount > 0 && (
        <View style={styles.membershipCard}>
          <Feather name="star" size={24} color={LuxeColors.primaryContainer} />
          <View style={styles.membershipContent}>
              <Text style={styles.membershipTitle}>Ưu đãi {membershipInfo.nameVi}</Text>
              <Text style={styles.membershipDesc}>
                Giảm {Math.round(membershipDiscount * 100)}% cho tất cả dịch vụ
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedService && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedService}
          activeOpacity={0.9}
        >
          <Text style={styles.continueBtnText}>TIẾP TỤC</Text>
          <Text style={styles.continueBtnIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '20',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: LuxeColors.onSurface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    alignItems: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressDotPending: {
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.md,
    paddingBottom: 120,
  },
  welcomeSection: {
    paddingVertical: LuxeSpacing.lg,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 20,
  },
  section: {
    gap: LuxeSpacing.md,
  },
  loadingState: {
    alignItems: 'center',
    padding: LuxeSpacing.xl * 2,
    gap: LuxeSpacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    padding: LuxeSpacing.xl * 2,
    gap: LuxeSpacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: LuxeColors.onSurfaceVariant,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '08',
    shadowColor: LuxeColors.primaryContainer,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  serviceImageContainer: {
    width: 56,
    height: 56,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContent: {
    flex: 1,
    marginLeft: LuxeSpacing.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 6,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceDiscount: {
    fontSize: 11,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceNote: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
  },
  servicePriceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  servicePriceDiscounted: {
    color: LuxeColors.primaryContainer,
  },
  priceNote: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LuxeColors.primaryContainer + '10',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    gap: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer + '20',
    marginTop: LuxeSpacing.md,
  },
  membershipContent: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  membershipDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '20',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  continueBtnDisabled: {
    backgroundColor: LuxeColors.surfaceVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  continueBtnIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
});

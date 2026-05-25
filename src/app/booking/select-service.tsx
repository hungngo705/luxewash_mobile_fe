/**
 * Advance Booking Flow - Step 3: Select Service
 * Service selection with pricing and loyalty points redemption
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers, mockVehicles, mockServices, Service, generateTimeSlots } from '@/data/types';

interface SelectServiceScreenProps {
  onSelect?: (service: Service) => void;
  onBack?: () => void;
}

export default function SelectServiceScreen({ onSelect, onBack }: SelectServiceScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const vehicleId = params.vehicleId as string;
  const dateParam = params.date as string;
  const timeSlotId = params.timeSlotId as string;

  const currentUser = user || mockUsers[0];
  const membershipInfo = MembershipConfig[currentUser?.membershipTier || 'standard'];
  const selectedVehicle = mockVehicles.find((v) => v.id === vehicleId) || mockVehicles[0];
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  const selectedTimeSlot = useMemo(() => {
    const slots = generateTimeSlots('stn_001');
    return slots.find((s) => s.id === timeSlotId) || slots[0];
  }, [timeSlotId]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  const currentTier = currentUser?.membershipTier || 'standard';
  const membershipDiscount = membershipInfo.discountRate;

  const pointsToUse = useLoyaltyPoints ? Math.min(currentUser?.loyaltyPoints || 0, 300) : 0;
  const pointsDiscount = Math.floor(pointsToUse / 10) * 1000;

  // Calculate totals
  const servicePrice = selectedService?.price || 0;
  const membershipDiscountAmount = Math.round(servicePrice * membershipDiscount);
  const totalDiscount = membershipDiscountAmount + pointsDiscount;
  const finalPrice = Math.max(0, servicePrice - totalDiscount);

  const handleContinue = () => {
    if (selectedService) {
      if (onSelect) {
        onSelect(selectedService);
      }
      router.push({
        pathname: '/booking/confirmation',
        params: {
          vehicleId,
          date: dateParam,
          timeSlotId,
          serviceId: selectedService.id,
          useLoyaltyPoints: useLoyaltyPoints ? 'true' : 'false',
          pointsToUse: pointsToUse.toString(),
        },
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    });
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'basic': return '🚿';
      case 'premium': return '✨';
      case 'deep_clean': return '🧹';
      case 'special': return '💎';
      default: return '🚗';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onBack ? onBack() : router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn dịch vụ</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🚗</Text>
            <Text style={styles.summaryText}>
              {selectedVehicle.brand} {selectedVehicle.model} • {selectedVehicle.licensePlate}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>📅</Text>
            <Text style={styles.summaryText}>
              {formatDate(selectedDate)} • {selectedTimeSlot.startTime}
            </Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>

          {mockServices.map((service) => {
            const isSelected = selectedService?.id === service.id;
            const discountedPrice = Math.round(service.price * (1 - membershipDiscount));
            const icon = getServiceIcon(service.category);

            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                onPress={() => setSelectedService(service)}
              >
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedIcon}>✓</Text>
                  </View>
                )}

                <View style={styles.serviceImageContainer}>
                  <Text style={styles.serviceIcon}>{icon}</Text>
                </View>

                <View style={styles.serviceContent}>
                  <Text style={styles.serviceName}>{service.nameVi}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                  <View style={styles.serviceMeta}>
                    <Text style={styles.serviceDuration}>⏱ {service.duration} phút</Text>
                    {membershipDiscount > 0 && (
                      <Text style={styles.serviceDiscount}>
                        Giảm {Math.round(membershipDiscount * 100)}%
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.servicePriceContainer}>
                  {membershipDiscount > 0 && (
                    <Text style={styles.originalPrice}>
                      {service.price.toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                  <Text style={[styles.servicePrice, membershipDiscount > 0 && styles.servicePriceDiscounted]}>
                    {discountedPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loyalty Points Section */}
        {(currentUser?.loyaltyPoints || 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điểm thưởng</Text>
            <View style={styles.pointsCard}>
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsAvailable}>
                  {(currentUser?.loyaltyPoints || 0).toLocaleString('vi-VN')} điểm
                </Text>
                <Text style={styles.pointsRate}>100 điểm = 10.000đ</Text>
              </View>
              <TouchableOpacity
                style={[styles.pointsToggle, useLoyaltyPoints && styles.pointsToggleActive]}
                onPress={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
              >
                <View style={[styles.pointsToggleThumb, useLoyaltyPoints && styles.pointsToggleThumbActive]} />
              </TouchableOpacity>
            </View>

            {useLoyaltyPoints && (
              <View style={styles.pointsSuggestion}>
                <Text style={styles.pointsSuggestionText}>
                  💡 Sử dụng {Math.min(currentUser?.loyaltyPoints || 0, 300)} điểm để giảm {pointsDiscount.toLocaleString('vi-VN')}đ?
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Membership Benefits */}
        {membershipDiscount > 0 && (
          <View style={styles.membershipBenefitCard}>
            <View style={styles.membershipBenefitIcon}>
              <Text style={styles.membershipBenefitIconText}>🏆</Text>
            </View>
            <View style={styles.membershipBenefitContent}>
              <Text style={styles.membershipBenefitTitle}>
                Ưu đãi thành viên {membershipInfo.nameVi}
              </Text>
              <Text style={styles.membershipBenefitDesc}>
                Bạn được giảm {Math.round(membershipDiscount * 100)}% cho dịch vụ này
              </Text>
            </View>
          </View>
        )}

        {/* Price Summary */}
        {selectedService && (
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá dịch vụ</Text>
              <Text style={styles.priceValue}>{servicePrice.toLocaleString('vi-VN')}đ</Text>
            </View>
            {membershipDiscountAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giảm thành viên</Text>
                <Text style={styles.priceDiscount}>-{membershipDiscountAmount.toLocaleString('vi-VN')}đ</Text>
              </View>
            )}
            {pointsDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giảm điểm thưởng</Text>
                <Text style={styles.priceDiscount}>-{pointsDiscount.toLocaleString('vi-VN')}đ</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Tổng thanh toán</Text>
              <Text style={styles.priceTotalValue}>{finalPrice.toLocaleString('vi-VN')}đ</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: LuxeColors.onSurfaceVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    alignItems: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotCompleted: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressDotActive: {
    backgroundColor: LuxeColors.primaryContainer,
    borderWidth: 2,
    borderColor: LuxeColors.primary,
  },
  progressLineCompleted: {
    width: 40,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: LuxeColors.surfaceVariant,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.md,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.lg,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryText: {
    fontSize: 14,
    color: LuxeColors.onSurface,
  },
  section: {
    marginBottom: LuxeSpacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.md,
  },

  // Service card styles
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
  },
  serviceCardSelected: {
    borderWidth: 2,
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '10',
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
  },
  selectedIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  serviceImageContainer: {
    width: 56,
    height: 56,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceContent: {
    flex: 1,
    marginLeft: LuxeSpacing.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 6,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceDuration: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  serviceDiscount: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  servicePriceDiscounted: {
    color: LuxeColors.primaryContainer,
  },

  // Loyalty points styles
  pointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
  },
  pointsInfo: {},
  pointsAvailable: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  pointsRate: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  pointsToggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: LuxeColors.surfaceContainerHigh,
    padding: 2,
    justifyContent: 'center',
  },
  pointsToggleActive: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  pointsToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  pointsSuggestion: {
    backgroundColor: LuxeColors.primaryContainer + '10',
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.sm,
    marginTop: LuxeSpacing.sm,
  },
  pointsSuggestionText: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    fontStyle: 'italic',
  },

  // Membership benefit card
  membershipBenefitCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    gap: LuxeSpacing.md,
    marginBottom: LuxeSpacing.lg,
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer + '30',
  },
  membershipBenefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LuxeColors.primaryContainer + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipBenefitIconText: {
    fontSize: 20,
  },
  membershipBenefitContent: {
    flex: 1,
  },
  membershipBenefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  membershipBenefitDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },

  // Price summary
  priceSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  priceDiscount: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.primaryContainer,
  },
  priceDivider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginVertical: LuxeSpacing.sm,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  priceTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },

  // Bottom action
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(247, 249, 251, 0.9)',
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

/**
 * Advance Booking Flow - Final Step: Confirmation
 * Booking summary and payment confirmation
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers, mockVehicles, mockServices, generateTimeSlots, Booking } from '@/data/types';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const vehicleId = params.vehicleId as string;
  const dateParam = params.date as string;
  const timeSlotId = params.timeSlotId as string;
  const serviceId = params.serviceId as string;
  const useLoyaltyPoints = params.useLoyaltyPoints === 'true';
  const pointsToUse = parseInt(params.pointsToUse as string) || 0;

  const currentUser = user || mockUsers[0];
  const membershipInfo = MembershipConfig[currentUser?.membershipTier || 'standard'];
  const selectedVehicle = mockVehicles.find((v) => v.id === vehicleId) || mockVehicles[0];
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  const selectedService = mockServices.find((s) => s.id === serviceId) || mockServices[0];
  const selectedTimeSlot = useMemo(() => {
    const slots = generateTimeSlots('stn_001');
    return slots.find((s) => s.id === timeSlotId) || slots[0];
  }, [timeSlotId]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'bank'>('wallet');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  const membershipDiscount = membershipInfo.discountRate;

  const pointsDiscount = Math.floor(pointsToUse / 10) * 1000;
  const voucherDiscount = voucherApplied ? 20000 : 0;
  const servicePrice = selectedService?.price || 0;
  const membershipDiscountAmount = Math.round(servicePrice * membershipDiscount);
  const totalDiscount = membershipDiscountAmount + pointsDiscount + voucherDiscount;
  const finalPrice = Math.max(0, servicePrice - totalDiscount);

  const handleConfirmBooking = () => {
    // Create booking and navigate to success
    router.replace({
      pathname: '/booking/success',
      params: {
        bookingId: `BK${Date.now()}`,
        vehicleId,
        serviceId,
        date: dateParam,
        timeSlot: selectedTimeSlot.startTime,
        finalAmount: finalPrice.toString(),
      },
    });
  };

  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase() === 'GIAM20K') {
      setVoucherApplied(true);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour}:${minutes}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt lịch</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Service Summary */}
        <View style={styles.section}>
          <View style={styles.serviceSummaryCard}>
            <View style={styles.serviceSummaryHeader}>
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>🚿</Text>
              </View>
              <View style={styles.serviceSummaryInfo}>
                <Text style={styles.serviceName}>{selectedService?.nameVi}</Text>
                <View style={styles.serviceMeta}>
                  <Text style={styles.serviceMetaText}>📅 {formatDate(selectedDate)}</Text>
                  <Text style={styles.serviceMetaDot}>•</Text>
                  <Text style={styles.serviceMetaText}>🕐 {formatTime(selectedTimeSlot.startTime)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.section}>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Xe</Text>
              <Text style={styles.vehicleValue}>
                {selectedVehicle.brand} {selectedVehicle.model}
              </Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Biển số</Text>
              <Text style={styles.vehicleValue}>{selectedVehicle.licensePlate}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Trạm</Text>
              <Text style={styles.vehicleValue}>LuxeWash Quận 1</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === 'wallet' && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod('wallet')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={[styles.paymentIcon, selectedPaymentMethod === 'wallet' && styles.paymentIconActive]}>
                  <Text style={styles.paymentIconText}>👛</Text>
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Số dư ví</Text>
                  <Text style={styles.paymentBalance}>{(currentUser?.loyaltyPoints || 0).toLocaleString('vi-VN')} VND</Text>
                </View>
              </View>
              <View style={[styles.radioOuter, selectedPaymentMethod === 'wallet' && styles.radioOuterSelected]}>
                {selectedPaymentMethod === 'wallet' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === 'bank' && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod('bank')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentIcon}>
                  <Text style={styles.paymentIconText}>🏦</Text>
                </View>
                <Text style={styles.paymentTitle}>Chuyển khoản ngân hàng</Text>
              </View>
              <View style={[styles.radioOuter, selectedPaymentMethod === 'bank' && styles.radioOuterSelected]}>
                {selectedPaymentMethod === 'bank' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Voucher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyến mãi</Text>
          <View style={styles.voucherInput}>
            <Text style={styles.voucherIcon}>🎟️</Text>
            <View style={styles.voucherInputContainer}>
              <Text style={styles.voucherPlaceholder}>Mã giảm giá/Voucher</Text>
              <View style={styles.voucherTextInput}>
                <Text style={styles.voucherCodeText}>
                  {voucherCode || 'Nhập mã giảm giá...'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyVoucher}>
              <Text style={styles.applyBtnText}>ÁP DỤNG</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickVouchers}>
            <TouchableOpacity
              style={styles.quickVoucher}
              onPress={() => setVoucherCode('KHAITRUONG50')}
            >
              <Text style={styles.quickVoucherText}>KHAITRUONG50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickVoucher}
              onPress={() => setVoucherCode('GIAM20K')}
            >
              <Text style={styles.quickVoucherText}>GIAM20K</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Billing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Giá gốc</Text>
              <Text style={styles.billingValue}>{servicePrice.toLocaleString('vi-VN')}đ</Text>
            </View>
            {membershipDiscountAmount > 0 && (
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Giảm thành viên ({Math.round(membershipDiscount * 100)}%)</Text>
                <Text style={styles.billingDiscount}>-{membershipDiscountAmount.toLocaleString('vi-VN')}đ</Text>
              </View>
            )}
            {pointsDiscount > 0 && (
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Giảm điểm thưởng</Text>
                <Text style={styles.billingDiscount}>-{pointsDiscount.toLocaleString('vi-VN')}đ</Text>
              </View>
            )}
            {voucherDiscount > 0 && (
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Mã giảm giá/Voucher</Text>
                <Text style={styles.billingDiscount}>-{voucherDiscount.toLocaleString('vi-VN')}đ</Text>
              </View>
            )}
            <View style={styles.billingDivider} />
            <View style={styles.billingRow}>
              <Text style={styles.billingTotalLabel}>Tổng thanh toán</Text>
              <Text style={styles.billingTotalValue}>{finalPrice.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Bằng việc xác nhận đặt lịch, bạn đồng ý với{' '}
            <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
            <Text style={styles.termsLink}>Chính sách hủy lịch</Text> của LuxeWash.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBooking}>
          <Text style={styles.confirmBtnIcon}>🔒</Text>
          <Text style={styles.confirmBtnText}>XÁC NHẬN ĐẶT LỊCH</Text>
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
    width: 20,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressLine: {
    width: 20,
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
  section: {
    marginBottom: LuxeSpacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LuxeColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: LuxeSpacing.md,
  },

  // Service summary
  serviceSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
  },
  serviceSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.md,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceSummaryInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceMetaText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  serviceMetaDot: {
    color: LuxeColors.onSurfaceVariant,
  },

  // Vehicle card
  vehicleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '20',
  },
  vehicleLabel: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },

  // Payment methods
  paymentMethods: {
    gap: LuxeSpacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '10',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.md,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconActive: {
    backgroundColor: LuxeColors.primaryContainer + '30',
  },
  paymentIconText: {
    fontSize: 20,
  },
  paymentInfo: {},
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  paymentBalance: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: LuxeColors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: LuxeColors.primaryContainer,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LuxeColors.primaryContainer,
  },

  // Voucher
  voucherInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.sm,
    gap: LuxeSpacing.sm,
  },
  voucherIcon: {
    fontSize: 20,
  },
  voucherInputContainer: {
    flex: 1,
  },
  voucherPlaceholder: {
    fontSize: 10,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 2,
  },
  voucherTextInput: {
    flex: 1,
  },
  voucherCodeText: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  applyBtn: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  quickVouchers: {
    flexDirection: 'row',
    gap: LuxeSpacing.sm,
    marginTop: LuxeSpacing.sm,
  },
  quickVoucher: {
    backgroundColor: LuxeColors.surfaceContainer,
    paddingHorizontal: LuxeSpacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '50',
  },
  quickVoucherText: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
  },

  // Billing
  billingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  billingDiscount: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.primaryContainer,
  },
  billingDivider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginVertical: LuxeSpacing.sm,
  },
  billingTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  billingTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },

  // Terms
  termsSection: {
    marginBottom: LuxeSpacing.lg,
  },
  termsText: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: LuxeColors.primaryContainer,
    fontWeight: '500',
  },

  // Bottom action
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(247, 249, 251, 0.95)',
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '20',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  confirmBtnIcon: {
    fontSize: 18,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

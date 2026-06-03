/**
 * Advance Booking Flow - Final Step: Confirmation
 * Summary of service, vehicle(s), date/time, and payment
 */

import React, { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/api';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { user, walletBalance, refreshWallet } = useAuth();
  const params = useLocalSearchParams();

  const serviceIdParam = parseInt(params.serviceId as string) || 0;
  const serviceNameParam = (params.serviceName as string) || '';
  const servicePriceParam = parseInt(params.servicePrice as string) || 0;
  const membershipDiscountParam = parseFloat(params.membershipDiscount as string) || 0;
  const dateParam = (params.date as string) || '';
  const slotIdParam = parseInt(params.slotId as string) || 0;
  const timeRangeParam = (params.timeRange as string) || '';
  const vehicleIdsParam = (params.vehicleIds as string) || '';
  const vehicleTypeIdsParam = (params.vehicleTypeIds as string) || '';
  const vehicleBrandsParam = (params.vehicleBrands as string) || '';

  const vehiclePlateList = vehicleIdsParam ? vehicleIdsParam.split(',') : [];
  const vehicleTypeIdList = vehicleTypeIdsParam ? vehicleTypeIdsParam.split(',').map(Number) : [];

  const vehicleCount = vehiclePlateList.length;
  const subtotal = servicePriceParam * vehicleCount;
  const membershipDiscountAmount = Math.round(subtotal * membershipDiscountParam);
  const finalPrice = Math.max(0, subtotal - membershipDiscountAmount);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'bank'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirmBooking = async () => {
    if (selectedPaymentMethod === 'wallet' && walletBalance < finalPrice) {
      alert('Số dư không đủ. Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức thanh toán khác.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingVehicles = vehiclePlateList.map((plate, i) => ({
        licensePlate: plate,
        serviceId: serviceIdParam,
        vehicleTypeId: vehicleTypeIdList[i] ?? 1,
      }));

      const [year, month, day] = dateParam.split('-').map(Number);
      const scheduledDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();

      const res = await bookingService.createBooking({
        scheduledDate,
        slotId: slotIdParam,
        pointsToUse: 0,
        voucherId: null,
        vehicles: bookingVehicles,
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        const bookingId = (res.data as any)?.bookingId || 0;
        await refreshWallet?.();
        router.replace({
          pathname: '/booking/success',
          params: {
            bookingId: String(bookingId),
            serviceName: serviceNameParam,
            date: dateParam,
            timeRange: timeRangeParam,
            vehicleCount: String(vehicleCount),
            finalAmount: String(finalPrice),
          },
        });
      } else {
        alert(res.message || 'Tạo đặt lịch thất bại');
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert(err?.message || 'Đã xảy ra lỗi khi tạo đặt lịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={LuxeColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt lịch</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress */}
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
        {/* Service Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconContainer}>
              <Feather name="award" size={22} color={LuxeColors.primaryContainer} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{serviceNameParam}</Text>
              <Text style={styles.cardSubtitle}>
                {vehicleCount} xe • {servicePriceParam.toLocaleString('vi-VN')}đ/xe
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Feather name="calendar" size={18} color={LuxeColors.primaryContainer} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Ngày</Text>
              <Text style={styles.cardValue}>{formatDateDisplay(dateParam)}</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <Feather name="clock" size={18} color={LuxeColors.primaryContainer} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Giờ</Text>
              <Text style={styles.cardValue}>{timeRangeParam}</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <Feather name="truck" size={18} color={LuxeColors.primaryContainer} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Xe ({vehicleCount})</Text>
              <Text style={styles.cardValue}>{vehicleBrandsParam || vehiclePlateList.join(', ')}</Text>
              <Text style={styles.cardSubtitle}>{vehiclePlateList.join(', ')}</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <Feather name="map-pin" size={18} color={LuxeColors.primaryContainer} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Trạm</Text>
              <Text style={styles.cardValue}>LuxeWash</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        </View>

        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === 'wallet' && styles.paymentMethodSelected,
              walletBalance < finalPrice && styles.paymentMethodDisabled,
            ]}
            onPress={() => {
              if (walletBalance >= finalPrice) setSelectedPaymentMethod('wallet');
            }}
            disabled={walletBalance < finalPrice}
            activeOpacity={0.8}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentRadio, selectedPaymentMethod === 'wallet' && styles.paymentRadioSelected]}>
                {selectedPaymentMethod === 'wallet' && <View style={styles.paymentRadioInner} />}
              </View>
              <View style={styles.paymentIconWrap}>
                <Feather name="credit-card" size={22} color={LuxeColors.primaryContainer} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Số dư ví</Text>
                <Text style={[styles.paymentBalance, walletBalance < finalPrice && styles.paymentBalanceDanger]}>
                  {walletBalance.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            </View>
            {walletBalance < finalPrice && (
              <Text style={styles.paymentWarning}>Không đủ</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentMethod, selectedPaymentMethod === 'bank' && styles.paymentMethodSelected]}
            onPress={() => setSelectedPaymentMethod('bank')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentRadio, selectedPaymentMethod === 'bank' && styles.paymentRadioSelected]}>
                {selectedPaymentMethod === 'bank' && <View style={styles.paymentRadioInner} />}
              </View>
              <View style={styles.paymentIconWrap}>
                <Feather name="grid" size={22} color={LuxeColors.primaryContainer} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Chuyển khoản ngân hàng</Text>
                <Text style={styles.paymentSubtitle}>Thanh toán QR / chuyển khoản</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Billing Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>
              {serviceNameParam} × {vehicleCount} xe
            </Text>
            <Text style={styles.billingValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
          </View>
          {membershipDiscountAmount > 0 && (
            <View style={styles.billingRow}>
              <Text style={[styles.billingLabel, styles.billingDiscountLabel]}>
                Giảm thành viên ({Math.round(membershipDiscountParam * 100)}%)
              </Text>
              <Text style={styles.billingDiscount}>-{membershipDiscountAmount.toLocaleString('vi-VN')}đ</Text>
            </View>
          )}
          <View style={styles.billingDivider} />
          <View style={styles.billingRow}>
            <Text style={styles.billingTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.billingTotalValue}>{finalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          Bằng việc xác nhận đặt lịch, bạn đồng ý với{' '}
          <Text style={styles.termsLink}>�iều khoản dịch vụ</Text> và{' '}
          <Text style={styles.termsLink}>chính sách hủy lịch</Text> của LuxeWash.
        </Text>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          activeOpacity={0.9}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#ffffff" />
              <Text style={styles.confirmBtnText}>XÁC NHẬN ĐẶT LỊCH</Text>
            </>
          )}
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
    borderWidth: 2,
    borderColor: LuxeColors.primary,
  },
  progressDotCompleted: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressLineCompleted: {
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.md,
    paddingVertical: 6,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.primaryContainer + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  cardLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginTop: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '20',
    marginVertical: 6,
  },
  sectionHeader: {
    marginBottom: LuxeSpacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: LuxeColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentMethods: {
    gap: LuxeSpacing.sm,
    marginBottom: LuxeSpacing.lg,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '08',
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.md,
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: LuxeColors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioSelected: {
    borderColor: LuxeColors.primaryContainer,
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LuxeColors.primaryContainer,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.primaryContainer + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 1,
  },
  paymentBalance: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 1,
  },
  paymentBalanceDanger: {
    color: LuxeColors.error,
  },
  paymentWarning: {
    fontSize: 11,
    fontWeight: '700',
    color: LuxeColors.error,
    backgroundColor: LuxeColors.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  billingLabel: {
    fontSize: 14,
    color: LuxeColors.onSurface,
  },
  billingDiscountLabel: {
    color: LuxeColors.primaryContainer,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  billingDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  billingDivider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginVertical: LuxeSpacing.sm,
  },
  billingTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  billingTotalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  termsText: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: LuxeSpacing.md,
  },
  termsLink: {
    color: LuxeColors.primaryContainer,
    fontWeight: '500',
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
  confirmBtn: {
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
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

/**
 * Advance Booking Flow - Success Screen
 * Shows successful booking confirmation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';

export function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookingId = params.bookingId as string;
  const date = params.date as string;
  const timeSlot = params.timeSlot as string;
  const finalAmount = params.finalAmount as string;

  const formattedDate = date ? new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }) : '';

  const handleViewDetails = () => {
    router.replace('/(main)/appointments' as any);
  };

  const handleBackToHome = () => {
    router.replace('/(main)' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
          <View style={styles.successRing} />
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
          <Text style={styles.successSubtitle}>
            Cảm ơn bạn đã đặt lịch tại LuxeWash. Chúng tôi đã gửi xác nhận đến số điện thoại của bạn.
          </Text>
        </View>

        {/* Booking Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã đặt lịch</Text>
            <Text style={styles.detailValue}>{bookingId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giờ</Text>
            <Text style={styles.detailValue}>{timeSlot}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạm</Text>
            <Text style={styles.detailValue}>LuxeWash Quận 1</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>
              {parseInt(finalAmount || '0').toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Vui lòng đến đúng giờ hoặc trước 5 phút. Nếu cần hủy lịch, vui lòng thông báo trước ít nhất 2 giờ.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleViewDetails}>
            <Text style={styles.primaryBtnText}>Xem lịch hẹn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToHome}>
            <Text style={styles.secondaryBtnText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: LuxeSpacing.lg,
    paddingTop: LuxeSpacing.xxl * 2,
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LuxeSpacing.xl,
  },
  successEmoji: {
    fontSize: 64,
    position: 'absolute',
  },
  successRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: LuxeColors.primaryContainer + '40',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: LuxeSpacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.sm,
  },
  successSubtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: LuxeSpacing.lg,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginVertical: LuxeSpacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: LuxeColors.primaryContainer + '10',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    gap: LuxeSpacing.sm,
    marginBottom: LuxeSpacing.xl,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: LuxeSpacing.md,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: LuxeColors.primaryContainer,
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
    alignItems: 'center',
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
});

export default BookingSuccessScreen;

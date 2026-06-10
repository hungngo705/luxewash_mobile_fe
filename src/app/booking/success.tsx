/**
 * Advance Booking Flow - Success Screen
 * Bold professional redesign with clean, confident layout
 */

import {
    LuxeBorderRadius,
    LuxeColors,
    LuxeSpacing,
    LuxeShadows,
} from "@/constants/luxeTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

export function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookingId = params.bookingId as string;
  const date = params.date as string;
  const timeSlot = params.timeSlot as string;
  const finalAmount = params.finalAmount as string;
  const voucherDiscount = parseInt(params.voucherDiscount as string) || 0;
  const branchName = (params.branchName as string) || 'LuxeWash';

  const formattedDate = date
    ? new Date(date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    : "";

  const handleViewDetails = () => {
    router.replace("/(main)/appointments" as any);
  };

  const handleBackToHome = () => {
    router.replace("/(main)" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success Icon */}
          <View style={styles.successIconWrap}>
            <View style={styles.successCircle}>
              <Feather name="check" size={48} color="#ffffff" />
            </View>
            <View style={styles.successRing} />
          </View>

          {/* Message */}
          <View style={styles.messageSection}>
            <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
            <Text style={styles.successSubtitle}>
              Cảm ơn bạn đã đặt lịch tại LuxeWash. Chúng tôi đã gửi xác nhận đến số điện thoại của bạn.
            </Text>
          </View>

          {/* Booking Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.detailIconWrap}>
                  <Feather name="hash" size={16} color={LuxeColors.primaryContainer} />
                </View>
                <Text style={styles.detailLabel}>Mã đặt lịch</Text>
              </View>
              <Text style={styles.detailValue}>#{bookingId}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.detailIconWrap}>
                  <Feather name="calendar" size={16} color={LuxeColors.primaryContainer} />
                </View>
                <Text style={styles.detailLabel}>Ngày</Text>
              </View>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.detailIconWrap}>
                  <Feather name="clock" size={16} color={LuxeColors.primaryContainer} />
                </View>
                <Text style={styles.detailLabel}>Giờ</Text>
              </View>
              <Text style={styles.detailValue}>{timeSlot}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.detailIconWrap}>
                  <Feather name="map-pin" size={16} color={LuxeColors.primaryContainer} />
                </View>
                <Text style={styles.detailLabel}>Trạm</Text>
              </View>
              <Text style={styles.detailValue}>{branchName}</Text>
            </View>

            <View style={styles.totalDivider} />

            {voucherDiscount > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.voucherLabelRow}>Giảm từ voucher</Text>
                  <Text style={styles.voucherDiscountRow}>
                    -{voucherDiscount.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
                <View style={styles.totalDivider} />
              </>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>
                {parseInt(finalAmount || "0").toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrap}>
              <Feather name="info" size={18} color={LuxeColors.primaryContainer} />
            </View>
            <Text style={styles.infoText}>
              Vui lòng đến đúng giờ hoặc trước 5 phút. Nếu cần hủy lịch, vui
              lòng thông báo trước ít nhất 2 giờ.
            </Text>
          </View>
        </ScrollView>

        {/* Pinned Actions — always visible at the bottom */}
        <View style={styles.actions}>
          <PrimaryButton
            title="Xem lịch hẹn"
            onPress={handleViewDetails}
            icon={<Feather name="calendar" size={18} color="#ffffff" />}
          />
          <SecondaryButton title="Quay về trang chủ" onPress={handleBackToHome} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  keyboardAvoid: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16, alignItems: "center" },
  successIconWrap: {
    width: 120, height: 120, alignItems: "center", justifyContent: "center", marginBottom: 32,
  },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: "center", justifyContent: "center",
    ...LuxeShadows.xl,
  },
  successRing: {
    position: "absolute",
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: LuxeColors.primaryContainer + '30',
  },
  messageSection: { alignItems: "center", marginBottom: 32 },
  successTitle: { fontSize: 24, fontWeight: "800", color: LuxeColors.onSurface, marginBottom: 10, textAlign: "center" },
  successSubtitle: { fontSize: 14, color: LuxeColors.onSurfaceVariant, textAlign: "center", lineHeight: 22, paddingHorizontal: 16 },
  detailsCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...LuxeShadows.md,
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: LuxeColors.primaryContainer + '18', alignItems: "center", justifyContent: "center" },
  detailLabel: { fontSize: 14, color: LuxeColors.onSurfaceVariant },
  detailValue: { fontSize: 14, fontWeight: '700', color: LuxeColors.onSurface },
  detailDivider: { height: 1, backgroundColor: LuxeColors.outlineVariant + '25' },
  totalDivider: { height: 2, backgroundColor: LuxeColors.primaryContainer + '30', marginVertical: 8, borderRadius: 1 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  totalLabel: { fontSize: 16, fontWeight: "800", color: LuxeColors.onSurface },
  totalValue: { fontSize: 22, fontWeight: "800", color: LuxeColors.primaryContainer },
  voucherLabelRow: { fontSize: 14, color: LuxeColors.primaryContainer, fontWeight: "600" },
  voucherDiscountRow: { fontSize: 14, fontWeight: "700", color: LuxeColors.primaryContainer },
  infoBox: { flexDirection: "row", backgroundColor: LuxeColors.primaryContainer + '10', borderRadius: 16, padding: 16, gap: 12, marginBottom: 16, ...LuxeShadows.sm },
  infoIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ffffff', alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoText: { flex: 1, fontSize: 13, color: LuxeColors.onSurfaceVariant, lineHeight: 20 },
  actions: {
    width: "100%",
    backgroundColor: LuxeColors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '25',
    gap: 12,
  },
});

export default BookingSuccessScreen;

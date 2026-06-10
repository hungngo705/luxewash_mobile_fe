/**
 * Voucher Selection Modal for Booking Confirmation
 * Bottom-sheet modal to select an available voucher before placing a booking
 */

import {
  LuxeColors,
  LuxeShadows,
} from '@/constants/luxeTheme';
import type { Voucher } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CAMPAIGN_BADGE_CONFIG: Record<number, { label: string; bg: string; color: string; icon: string }> = {
  0: { label: 'Đổi điểm', bg: '#E0E7FF', color: '#4F46E5', icon: 'tag' },
  1: { label: 'Sinh nhật', bg: '#FEF3C7', color: '#D97706', icon: 'gift' },
  2: { label: 'Theo tuổi', bg: '#DBEAFE', color: '#2563EB', icon: 'calendar' },
  3: { label: 'Quay lại', bg: '#FCE7F3', color: '#DB2777', icon: 'repeat' },
  4: { label: 'VIP', bg: '#F3E8FF', color: '#7C3AED', icon: 'star' },
  5: { label: 'Kỷ niệm', bg: '#D1FAE5', color: '#059669', icon: 'award' },
};

function CampaignBadge({ campaignType }: { campaignType: number }) {
  const cfg = CAMPAIGN_BADGE_CONFIG[campaignType] ?? CAMPAIGN_BADGE_CONFIG[0];
  return (
    <View style={[styles.campaignBadge, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon as any} size={10} color={cfg.color} />
      <Text style={[styles.campaignBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getDaysRemaining(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isVoucherUsable(voucher: Voucher, orderAmount: number): { usable: boolean; reason?: string } {
  // voucherType: 0 = Discount, 1 = PhysicalGift
  if (voucher.voucherType === 1) {
    return { usable: false, reason: 'Quà tặng hiện vật' };
  }
  if (voucher.isUsed || voucher.usageCount >= voucher.maxUsagePerUser) {
    return { usable: false, reason: 'Đã sử dụng' };
  }
  if (new Date(voucher.expiryDate) < new Date()) {
    return { usable: false, reason: 'Đã hết hạn' };
  }
  if (voucher.minOrderAmount > 0 && orderAmount < voucher.minOrderAmount) {
    return { usable: false, reason: `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}đ` };
  }
  return { usable: true };
}

interface VoucherCardProps {
  voucher: Voucher;
  isSelected: boolean;
  usable: boolean;
  unusableReason?: string;
  orderAmount: number;
  onSelect: () => void;
}

function VoucherCard({ voucher, isSelected, usable, unusableReason, orderAmount, onSelect }: VoucherCardProps) {
  const daysLeft = getDaysRemaining(voucher.expiryDate);
  const discount = Math.min(voucher.discountAmount, orderAmount);

  return (
    <TouchableOpacity
      style={[
        styles.voucherCard,
        isSelected && styles.voucherCardSelected,
        !usable && styles.voucherCardDisabled,
      ]}
      onPress={usable ? onSelect : undefined}
      activeOpacity={usable ? 0.7 : 1}
    >
      <View style={styles.voucherLeftPanel}>
        <Text style={[styles.voucherDiscountAmount, !usable && styles.voucherDiscountAmountDisabled]}>
          -{formatCurrency(discount)}đ
        </Text>
        {voucher.pointsRequired > 0 && (
          <View style={styles.pointsChip}>
            <Text style={styles.pointsChipText}>{voucher.pointsRequired} điểm</Text>
          </View>
        )}
      </View>

      <View style={styles.voucherRightPanel}>
        <View style={styles.voucherTopRow}>
          <CampaignBadge campaignType={voucher.campaignType} />
          {voucher.requiredTierName && (
            <View style={styles.tierBadge}>
              <Feather name="star" size={9} color="#7C3AED" />
              <Text style={styles.tierBadgeText}>{voucher.requiredTierName}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.voucherExpiry, !usable && styles.voucherExpiryDisabled]}>
          <Feather name="clock" size={11} color={usable ? LuxeColors.onSurfaceVariant : '#999'} />
          {'  '}
          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn'} · HSD: {formatDate(voucher.expiryDate)}
        </Text>

        {voucher.minOrderAmount > 0 && (
          <Text style={[styles.voucherMinOrder, !usable && styles.voucherMinOrderDisabled]}>
            Đơn tối thiểu {formatCurrency(voucher.minOrderAmount)}đ
          </Text>
        )}

        {!usable && unusableReason && (
          <Text style={styles.unusableReason}>{unusableReason}</Text>
        )}
      </View>

      {isSelected && (
        <View style={styles.selectedCheck}>
          <Feather name="check" size={14} color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

interface VoucherSelectionModalProps {
  visible: boolean;
  vouchers: Voucher[];
  selectedVoucher: Voucher | null;
  orderAmount: number;
  loading?: boolean;
  onSelect: (voucher: Voucher | null) => void;
  onClose: () => void;
}

export function VoucherSelectionModal({
  visible,
  vouchers,
  selectedVoucher,
  orderAmount,
  loading,
  onSelect,
  onClose,
}: VoucherSelectionModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { marginTop: insets.top > 0 ? 4 : 12 }]} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Feather name="tag" size={20} color={LuxeColors.primaryContainer} />
              <Text style={styles.modalTitle}>Chọn voucher giảm giá</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color={LuxeColors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
              <Text style={styles.loadingText}>Đang tải voucher...</Text>
            </View>
          ) : vouchers.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Feather name="gift" size={40} color={LuxeColors.outlineVariant} />
              <Text style={styles.emptyTitle}>Chưa có voucher nào</Text>
              <Text style={styles.emptySubtitle}>
                Bạn chưa có voucher nào phù hợp.{'\n'}
                Đổi điểm thưởng để nhận voucher tại mục Voucher.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {vouchers.map((voucher) => {
                const { usable, reason } = isVoucherUsable(voucher, orderAmount);
                return (
                  <VoucherCard
                    key={voucher.voucherId}
                    voucher={voucher}
                    isSelected={selectedVoucher?.voucherId === voucher.voucherId}
                    usable={usable}
                    unusableReason={reason}
                    orderAmount={orderAmount}
                    onSelect={() => onSelect(voucher)}
                  />
                );
              })}
            </ScrollView>
          )}

          {/* Footer actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onSelect(null)}
            >
              <Feather
                name={selectedVoucher ? 'x-circle' : 'minus-circle'}
                size={18}
                color={selectedVoucher ? LuxeColors.error : LuxeColors.outline}
              />
              <Text
                style={[
                  styles.clearButtonText,
                  !selectedVoucher && styles.clearButtonTextDisabled,
                ]}
              >
                {selectedVoucher ? 'Bỏ chọn voucher' : 'Không sử dụng voucher'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    flex: 1,
    backgroundColor: LuxeColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 'auto',
    ...LuxeShadows.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LuxeColors.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '30',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  voucherCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    ...LuxeShadows.sm,
  },
  voucherCardSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '06',
  },
  voucherCardDisabled: {
    opacity: 0.55,
  },
  voucherLeftPanel: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: LuxeColors.outlineVariant + '30',
    marginRight: 12,
  },
  voucherDiscountAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: LuxeColors.primaryContainer,
  },
  voucherDiscountAmountDisabled: {
    color: LuxeColors.outline,
  },
  pointsChip: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pointsChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5',
  },
  voucherRightPanel: {
    flex: 1,
    gap: 4,
  },
  voucherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  campaignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  campaignBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
  },
  voucherExpiry: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  voucherExpiryDisabled: {
    color: '#999',
  },
  voucherMinOrder: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
  },
  voucherMinOrderDisabled: {
    color: '#999',
  },
  unusableReason: {
    fontSize: 11,
    color: LuxeColors.error,
    fontWeight: '600',
    marginTop: 2,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '30',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: LuxeColors.error + '10',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.error,
  },
  clearButtonTextDisabled: {
    color: LuxeColors.outline,
  },
});

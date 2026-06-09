/**
 * Vouchers Screen - LuxeWash
 * Browse and manage vouchers (auto-assigned + manual redeem)
 */

import {
  LuxeBorderRadius,
  LuxeColors,
  LuxeSpacing,
  LuxeShadows,
} from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { loyaltyService, type Voucher, type VoucherCampaignType } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getDaysRemaining = (expiryDate: string): number => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

type TabKey = 'all' | 'available' | 'used' | 'expired';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Còn hiệu lực' },
  { key: 'used', label: 'Đã dùng' },
  { key: 'expired', label: 'Hết hạn' },
];

const CAMPAIGN_Badge_CONFIG: Record<VoucherCampaignType, { label: string; bg: string; color: string; icon: string }> = {
  Birthday: { label: 'Sinh nhật', bg: '#FEF3C7', color: '#D97706', icon: 'gift' },
  Age: { label: 'Theo tuổi', bg: '#DBEAFE', color: '#2563EB', icon: 'calendar' },
  Winback: { label: 'Quay lại', bg: '#FCE7F3', color: '#DB2777', icon: 'repeat' },
  Vip: { label: 'VIP', bg: '#F3E8FF', color: '#7C3AED', icon: 'star' },
  Milestone: { label: 'Kỷ niệm', bg: '#D1FAE5', color: '#059669', icon: 'award' },
  Manual: { label: 'Đổi điểm', bg: '#E0E7FF', color: '#4F46E5', icon: 'tag' },
};

function CampaignBadge({ campaignType }: { campaignType: VoucherCampaignType }) {
  const cfg = CAMPAIGN_Badge_CONFIG[campaignType] ?? CAMPAIGN_Badge_CONFIG.Manual;
  return (
    <View style={[styles.campaignBadge, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon as any} size={10} color={cfg.color} />
      <Text style={[styles.campaignBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function TierBadge({ tierName }: { tierName: string | null }) {
  if (!tierName) return null;
  return (
    <View style={styles.tierBadge}>
      <Feather name="shield" size={10} color={LuxeColors.onSurfaceVariant} />
      <Text style={styles.tierBadgeText}>{tierName}+</Text>
    </View>
  );
}

function VoucherCard({
  voucher,
  onPress,
}: {
  voucher: Voucher;
  onPress?: () => void;
}) {
  const daysLeft = getDaysRemaining(voucher.expiryDate);
  const isExpired = daysLeft === 0;
  const isUsed = voucher.isUsed || voucher.usageCount >= voucher.maxUsagePerUser;

  const cfg = CAMPAIGN_Badge_CONFIG[voucher.campaignType] ?? CAMPAIGN_Badge_CONFIG.Manual;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.voucherCard,
        isUsed && styles.voucherCardUsed,
        isExpired && !isUsed && styles.voucherCardExpired,
        pressed && styles.voucherCardPressed,
      ]}
      onPress={onPress}
      disabled={isUsed || isExpired}
    >
      {/* Image banner */}
      {voucher.imageUrl && (
        <Image source={{ uri: voucher.imageUrl }} style={styles.voucherImage} />
      )}

      {/* Color accent strip */}
      <View style={[styles.cardAccent, { backgroundColor: cfg.color + '30' }]} />

      <View style={styles.cardContent}>
        {/* Top row: badge + tier */}
        <View style={styles.cardTopRow}>
          <CampaignBadge campaignType={voucher.campaignType} />
          <TierBadge tierName={voucher.requiredTierName} />
        </View>

        {/* Discount amount */}
        <View style={styles.discountRow}>
          <Text style={[styles.discountAmount, isUsed && styles.textMuted]}>
            -{formatCurrency(voucher.discountAmount)}đ
          </Text>
          {voucher.pointsRequired > 0 && (
            <Text style={styles.pointsCost}>
              {voucher.pointsRequired.toLocaleString('vi-VN')} điểm
            </Text>
          )}
        </View>

        {/* Code */}
        <Text style={[styles.voucherCode, isUsed && styles.textMuted]}>
          {voucher.code}
        </Text>

        {/* Min order */}
        {voucher.minOrderAmount > 0 && (
          <Text style={styles.minOrder}>
            Đơn tối thiểu: {formatCurrency(voucher.minOrderAmount)}đ
          </Text>
        )}

        {/* Usage progress */}
        <View style={styles.usageRow}>
          <View style={styles.usageBar}>
            <View
              style={[
                styles.usageFill,
                {
                  width: `${Math.min((voucher.usageCount / voucher.maxUsagePerUser) * 100, 100)}%`,
                  backgroundColor: cfg.color,
                },
              ]}
            />
          </View>
          <Text style={styles.usageText}>
            {voucher.usageCount}/{voucher.maxUsagePerUser} lượt
          </Text>
        </View>

        {/* Valid time window */}
        {voucher.validStartTime && voucher.validEndTime && (
          <Text style={styles.timeWindow}>
            Chỉ áp dụng: {voucher.validStartTime} - {voucher.validEndTime}
          </Text>
        )}

        {/* Bottom: expiry + status */}
        <View style={styles.cardBottomRow}>
          {isUsed ? (
            <View style={styles.usedBadge}>
              <Feather name="check-circle" size={12} color={LuxeColors.onSurfaceVariant} />
              <Text style={styles.usedBadgeText}>Đã dùng</Text>
            </View>
          ) : isExpired ? (
            <View style={styles.expiredBadge}>
              <Feather name="clock" size={12} color={LuxeColors.error} />
              <Text style={styles.expiredBadgeText}>Hết hạn</Text>
            </View>
          ) : daysLeft <= 3 ? (
            <View style={styles.expirySoonBadge}>
              <Feather name="alert-circle" size={12} color="#D97706" />
              <Text style={styles.expirySoonText}>Còn {daysLeft} ngày</Text>
            </View>
          ) : (
            <Text style={styles.expiryText}>HSD: {formatDate(voucher.expiryDate)}</Text>
          )}
          {!isUsed && !isExpired && (
            <Text style={styles.remainingText}>
              {voucher.remainingUsage} lượt còn lại
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function RedeemModal({
  visible,
  onClose,
  vouchers,
  onRedeem,
}: {
  visible: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onRedeem: (voucherId: number) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const redeemable = useMemo(
    () => vouchers.filter((v) => !v.isUsed && getDaysRemaining(v.expiryDate) > 0),
    [vouchers],
  );

  const handleRedeem = async () => {
    if (!selectedId) return;
    setRedeeming(true);
    try {
      await onRedeem(selectedId);
      setSelectedId(null);
      onClose();
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đổi voucher</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={LuxeColors.onSurface} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Chọn voucher bạn muốn đổi bằng điểm tích luỹ
          </Text>

          <ScrollView style={styles.modalList}>
            {redeemable.length === 0 ? (
              <Text style={styles.emptyModalText}>Không có voucher nào khả dụng</Text>
            ) : (
              redeemable.map((v) => (
                <Pressable
                  key={v.voucherId}
                  style={[
                    styles.redeemItem,
                    selectedId === v.voucherId && styles.redeemItemSelected,
                  ]}
                  onPress={() => setSelectedId(v.voucherId)}
                >
                  <View style={styles.redeemItemInfo}>
                    <Text style={styles.redeemItemCode}>{v.code}</Text>
                    <Text style={styles.redeemItemDiscount}>
                      -{formatCurrency(v.discountAmount)}đ
                    </Text>
                  </View>
                  <View style={styles.redeemItemRight}>
                    <Text style={styles.redeemItemPoints}>
                      {v.pointsRequired.toLocaleString('vi-VN')} điểm
                    </Text>
                    <Feather
                      name={selectedId === v.voucherId ? 'check-circle' : 'circle'}
                      size={20}
                      color={
                        selectedId === v.voucherId
                          ? LuxeColors.primaryContainer
                          : LuxeColors.outline
                      }
                    />
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.redeemBtn,
              (!selectedId || redeeming) && styles.redeemBtnDisabled,
            ]}
            onPress={handleRedeem}
            disabled={!selectedId || redeeming}
          >
            {redeeming ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.redeemBtnText}>
                {selectedId
                  ? `Đổi voucher (${redeemable.find((v) => v.voucherId === selectedId)?.pointsRequired.toLocaleString('vi-VN')} điểm)`
                  : 'Chọn voucher'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function VouchersScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await loyaltyService.getMyVouchers();
      if (res.statusCode === 200 && res.data) {
        setAllVouchers(res.data);
      }
    } catch (e) {
      console.warn('Could not load vouchers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredVouchers = useMemo(() => {
    const now = new Date();
    return allVouchers.filter((v) => {
      const expiry = new Date(v.expiryDate);
      const isExpired = expiry < now;
      const isUsed = v.isUsed || v.usageCount >= v.maxUsagePerUser;

      switch (activeTab) {
        case 'available':
          return !isUsed && !isExpired;
        case 'used':
          return isUsed;
        case 'expired':
          return isExpired;
        default:
          return true;
      }
    });
  }, [allVouchers, activeTab]);

  const handleRedeemVoucher = async (voucherId: number) => {
    setRedeeming(true);
    try {
      const res = await loyaltyService.redeemVoucher(voucherId);
      if (res.statusCode === 200) {
        await refreshProfile?.();
        loadData();
      }
    } catch (e: any) {
      alert(e?.message || 'Đổi voucher thất bại');
    } finally {
      setRedeeming(false);
    }
  };

  const tabCounts = useMemo(() => {
    const now = new Date();
    const counts: Record<TabKey, number> = { all: 0, available: 0, used: 0, expired: 0 };
    for (const v of allVouchers) {
      counts.all++;
      const expiry = new Date(v.expiryDate);
      const isExpired = expiry < now;
      const isUsed = v.isUsed || v.usageCount >= v.maxUsagePerUser;
      if (isUsed) counts.used++;
      else if (isExpired) counts.expired++;
      else counts.available++;
    }
    return counts;
  }, [allVouchers]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={LuxeColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kho voucher</Text>
        <TouchableOpacity
          style={styles.redeemPointsBtn}
          onPress={() => setShowRedeemModal(true)}
        >
          <Feather name="gift" size={18} color={LuxeColors.primaryContainer} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
        }
      >
        {/* Points Balance */}
        <View style={styles.pointsBanner}>
          <View style={styles.pointsBannerLeft}>
            <Text style={styles.pointsLabel}>Điểm hiện có</Text>
            <Text style={styles.pointsValue}>
              {(user?.loyaltyPoints ?? 0).toLocaleString('vi-VN')}
            </Text>
            <Text style={styles.pointsUnit}>điểm</Text>
          </View>
          <View style={styles.pointsBannerRight}>
            <Feather name="award" size={36} color={LuxeColors.primaryContainer + '60'} />
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {tabCounts[tab.key] > 0 && (
                <View
                  style={[
                    styles.tabCount,
                    activeTab === tab.key && styles.tabCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      activeTab === tab.key && styles.tabCountTextActive,
                    ]}
                  >
                    {tabCounts[tab.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Voucher List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={LuxeColors.primaryContainer} size="large" />
            <Text style={styles.loadingText}>Đang tải voucher...</Text>
          </View>
        ) : filteredVouchers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather
              name="package"
              size={48}
              color={LuxeColors.outlineVariant}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'all'
                ? 'Chưa có voucher nào'
                : activeTab === 'available'
                  ? 'Không có voucher khả dụng'
                  : activeTab === 'used'
                    ? 'Chưa có voucher đã dùng'
                    : 'Không có voucher hết hạn'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'all'
                ? 'Bạn sẽ nhận được voucher khi đủ điều kiện từ các chương trình của LuxeWash'
                : 'Tiếp tục sử dụng dịch vụ để nhận thêm voucher'}
            </Text>
          </View>
        ) : (
          <View style={styles.voucherList}>
            {filteredVouchers.map((voucher) => (
              <VoucherCard key={voucher.voucherId} voucher={voucher} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Redeem Modal */}
      <RedeemModal
        visible={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        vouchers={allVouchers}
        onRedeem={handleRedeemVoucher}
      />
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
  redeemPointsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  pointsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LuxeColors.primaryContainer,
    marginHorizontal: LuxeSpacing.lg,
    marginTop: LuxeSpacing.lg,
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.xl,
    ...LuxeShadows.lg,
  },
  pointsBannerLeft: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 13,
    color: LuxeColors.onPrimaryContainer,
    opacity: 0.8,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: LuxeColors.onPrimaryContainer,
    marginVertical: 2,
  },
  pointsUnit: {
    fontSize: 14,
    color: LuxeColors.onPrimaryContainer,
    opacity: 0.8,
  },
  pointsBannerRight: {
    paddingLeft: LuxeSpacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: LuxeSpacing.lg,
    marginTop: LuxeSpacing.lg,
    borderRadius: LuxeBorderRadius.lg,
    padding: 4,
    ...LuxeShadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: LuxeBorderRadius.md,
    gap: 4,
  },
  tabActive: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabCount: {
    backgroundColor: LuxeColors.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: LuxeColors.onSurfaceVariant,
  },
  tabCountTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginTop: LuxeSpacing.md,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  voucherList: {
    paddingHorizontal: LuxeSpacing.lg,
    paddingTop: LuxeSpacing.lg,
    gap: LuxeSpacing.md,
  },
  voucherCard: {
    backgroundColor: '#ffffff',
    borderRadius: LuxeBorderRadius.xl,
    overflow: 'hidden',
    ...LuxeShadows.md,
  },
  voucherCardUsed: {
    opacity: 0.6,
  },
  voucherCardExpired: {
    opacity: 0.7,
  },
  voucherCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  voucherImage: {
    width: '100%',
    height: 80,
    backgroundColor: LuxeColors.surfaceVariant,
  },
  cardAccent: {
    height: 4,
  },
  cardContent: {
    padding: LuxeSpacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  campaignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  campaignBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: LuxeColors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  discountAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: LuxeColors.primaryContainer,
  },
  textMuted: {
    color: LuxeColors.onSurfaceVariant,
  },
  pointsCost: {
    fontSize: 12,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
    backgroundColor: LuxeColors.primaryContainer + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  voucherCode: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    letterSpacing: 1,
    marginBottom: 4,
  },
  minOrder: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 8,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  usageBar: {
    flex: 1,
    height: 4,
    backgroundColor: LuxeColors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 2,
  },
  usageText: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  timeWindow: {
    fontSize: 11,
    color: LuxeColors.tertiary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LuxeColors.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LuxeColors.errorContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LuxeColors.error,
  },
  expirySoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expirySoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  expiryText: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 11,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  modalSubtitle: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalList: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  emptyModalText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 40,
  },
  redeemItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.background,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  redeemItemSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '10',
  },
  redeemItemInfo: {
    flex: 1,
  },
  redeemItemCode: {
    fontSize: 13,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  redeemItemDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    marginTop: 2,
  },
  redeemItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redeemItemPoints: {
    fontSize: 12,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: LuxeBorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...LuxeShadows.primary,
  },
  redeemBtnDisabled: {
    opacity: 0.6,
  },
  redeemBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});

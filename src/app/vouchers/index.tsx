/**
 * Vouchers Screen - LuxeWash
 * Browse and redeem vouchers
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { loyaltyService, type Voucher } from '@/services/api';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function VouchersScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeRedeeming, setCodeRedeeming] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await loyaltyService.getMyVouchers();
      if (res.statusCode === 200 && res.data) {
        setMyVouchers(res.data);
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

  const handleRedeemByCode = async () => {
    if (!codeInput.trim()) {
      alert('Vui lòng nhập mã voucher');
      return;
    }
    setCodeRedeeming(true);
    try {
      const res = await loyaltyService.redeemVoucher(codeInput.trim().toUpperCase());
      if (res.statusCode === 200) {
        alert('Bạn đã đổi voucher thành công!');
        setCodeInput('');
        await refreshProfile?.();
        loadData();
      } else {
        alert(res.message || 'Mã voucher không hợp lệ.');
      }
    } catch (e: any) {
      const msg = e?.message || 'Mã voucher không hợp lệ.';
      alert(msg);
    } finally {
      setCodeRedeeming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher</Text>
        <View style={styles.placeholder} />
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
          <Text style={styles.pointsLabel}>Điểm hiện có</Text>
          <Text style={styles.pointsValue}>
            {user?.loyaltyPoints?.toLocaleString('vi-VN') || '0'}
          </Text>
          <Text style={styles.pointsUnit}>điểm</Text>
        </View>

        {/* Redeem by Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhập mã voucher</Text>
          <View style={styles.codeInputRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Nhập mã (VD: KHAITRUONG50)"
              placeholderTextColor={LuxeColors.onSurfaceVariant}
              value={codeInput}
              onChangeText={setCodeInput}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.codeBtn, codeRedeeming && styles.codeBtnDisabled]}
              onPress={handleRedeemByCode}
              disabled={codeRedeeming}
            >
              {codeRedeeming ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.codeBtnText}>Đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* My Vouchers */}
        {myVouchers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voucher của tôi</Text>
            {myVouchers.map(v => (
              <View key={v.voucherId} style={[styles.myVoucherCard, v.isUsed && styles.myVoucherCardUsed]}>
                <View style={styles.voucherLeft}>
                  <Text style={styles.voucherAmount}>
                    -{formatCurrency(v.discountAmount)}đ
                  </Text>
                  <Text style={styles.voucherCode}>{v.code}</Text>
                </View>
                <View style={styles.voucherRight}>
                  {v.isUsed ? (
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedBadgeText}>Đã dùng</Text>
                    </View>
                  ) : (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Còn hiệu lực</Text>
                    </View>
                  )}
                  <Text style={styles.voucherExpiry}>
                    HSD: {formatDate(v.expiryDate)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  pointsBanner: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.lg,
    alignItems: 'center',
    marginBottom: LuxeSpacing.lg,
  },
  pointsLabel: {
    fontSize: 13,
    color: LuxeColors.onPrimaryContainer,
    opacity: 0.8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: LuxeColors.onPrimaryContainer,
    marginVertical: 4,
  },
  pointsUnit: {
    fontSize: 14,
    color: LuxeColors.onPrimaryContainer,
    opacity: 0.8,
  },
  section: {
    marginBottom: LuxeSpacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.md,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: LuxeSpacing.sm,
  },
  codeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    fontSize: 15,
    color: LuxeColors.onSurface,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
  },
  codeBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    paddingHorizontal: LuxeSpacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBtnDisabled: {
    opacity: 0.7,
  },
  codeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  myVoucherCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.sm,
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer + '40',
  },
  myVoucherCardUsed: {
    opacity: 0.6,
  },
  voucherLeft: {
    flex: 1,
  },
  voucherAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    fontFamily: 'monospace',
  },
  voucherRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  activeBadge: {
    backgroundColor: LuxeColors.primaryContainer + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  usedBadge: {
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
  voucherExpiry: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  catalogCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.sm,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '20',
  },
  catalogLeft: {
    flex: 1,
    marginRight: LuxeSpacing.md,
  },
  catalogDiscount: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    marginBottom: 4,
  },
  catalogTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  catalogDesc: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 6,
    lineHeight: 16,
  },
  catalogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.sm,
  },
  catalogPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  expirySoon: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  catalogRight: {
    justifyContent: 'center',
  },
  redeemBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  redeemBtnDisabled: {
    opacity: 0.7,
  },
  redeemBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  redeemedBtn: {
    backgroundColor: LuxeColors.surfaceVariant,
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  redeemedBtnText: {
    color: LuxeColors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: LuxeSpacing.xl,
  },
});

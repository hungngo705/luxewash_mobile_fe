/**
 * Wallet Home Screen
 * Shows wallet balance as points and transaction history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { walletService, type WalletBalance, type Transaction } from '@/services/api';
import { vndToPoints, formatVnd, pointsToVnd } from '@/utils/format';

const POINTS_LABEL = 'điểm';
const VND_PER_POINT = 10000;

const transactionTypeLabel: Record<string, string> = {
  TopUp: 'Nạp điểm',
  Booking: 'Thanh toán đơn hàng',
  Refund: 'Hoàn điểm',
  Upsell: 'Phụ phí',
  PointReward: 'Tích điểm',
  PointRedeem: 'Đổi điểm',
};

const transactionTypeColor: Record<string, string> = {
  TopUp: '#10b981',
  Refund: '#10b981',
  Booking: '#ef4444',
  Upsell: '#ef4444',
  PointReward: '#f59e0b',
  PointRedeem: '#8b5cf6',
};

export default function WalletScreen() {
  const router = useRouter();
  const { walletBalance, refreshWallet } = useAuth();

  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [walletRes, txnRes] = await Promise.all([
      walletService.getBalance(),
      walletService.getTransactions(),
    ]);

    if (walletRes.statusCode === 200 && walletRes.data) {
      setWallet(walletRes.data);
    }
    if (txnRes.statusCode === 200 && txnRes.data) {
      setRecentTxns(txnRes.data.slice(0, 10));
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Primary balance in points
  const primaryBalance = wallet?.balance ?? walletBalance ?? 0;
  const primaryPoints = vndToPoints(primaryBalance);
  const mainPoints = wallet?.totalPoints ?? primaryPoints;
  const promoPoints = wallet?.promotionPoints ?? 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={LuxeColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví của tôi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LuxeColors.primaryContainer} />
        }
      >
        {/* Points Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <View style={styles.gemIconWrap}>
              <Feather name="star" size={28} color="#fff" />
            </View>
            <Text style={styles.balanceLabel}>Số dư điểm</Text>
          </View>
          <Text style={styles.balancePoints}>{mainPoints.toLocaleString('vi-VN')}</Text>
          <Text style={styles.balanceUnit}>{POINTS_LABEL}</Text>
          <Text style={styles.balanceSubtitle}>≈ {formatVnd(pointsToVnd(mainPoints))}</Text>
          <TouchableOpacity
            style={styles.topUpBtn}
            onPress={() => router.push('/wallet/top-up')}
          >
            <Feather name="plus-circle" size={18} color={LuxeColors.primaryContainer} />
            <Text style={styles.topUpBtnText}>Nạp điểm</Text>
          </TouchableOpacity>
        </View>

        {/* Points Breakdown */}
        <View style={styles.pointsRow}>
          <View style={[styles.pointCard, { flex: 1 }]}>
            <View style={[styles.pointIconWrap, { backgroundColor: '#00668915' }]}>
              <Feather name="star" size={18} color={LuxeColors.primary} />
            </View>
            <Text style={styles.pointLabel}>Điểm chính</Text>
            <Text style={styles.pointValue}>{mainPoints.toLocaleString('vi-VN')}</Text>
            <Text style={styles.pointSubtext}>1 điểm = {VND_PER_POINT.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={{ width: LuxeSpacing.md }} />
          <View style={[styles.pointCard, { flex: 1 }]}>
            <View style={[styles.pointIconWrap, { backgroundColor: '#f59e0b15' }]}>
              <Feather name="zap" size={18} color="#f59e0b" />
            </View>
            <Text style={styles.pointLabel}>Điểm khuyến mãi</Text>
            <Text style={[styles.pointValue, { color: '#f59e0b' }]}>{promoPoints.toLocaleString('vi-VN')}</Text>
            <Text style={styles.pointSubtext}>Thưởng khi hoàn thành</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiện ích</Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/wallet/top-up')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#10b98115' }]}>
                <Feather name="plus-circle" size={22} color="#10b981" />
              </View>
              <Text style={styles.actionLabel}>Nạp điểm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/wallet/transactions')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: LuxeColors.primaryContainer + '25' }]}>
                <Feather name="list" size={22} color={LuxeColors.primaryContainer} />
              </View>
              <Text style={styles.actionLabel}>Lịch sử</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            {recentTxns.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/wallet/transactions')}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTxns.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={LuxeColors.outlineVariant} />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            </View>
          ) : (
            recentTxns.map((txn) => {
              const isPositive = txn.transactionType === 'TopUp' || txn.transactionType === 'Refund' || txn.transactionType === 'PointReward';
              const points = vndToPoints(Math.abs(txn.amount));
              return (
                <View key={txn.transactionId} style={styles.txnItem}>
                  <View style={styles.txnLeft}>
                    <View style={[styles.txnDot, { backgroundColor: transactionTypeColor[txn.transactionType] ?? '#6f787f' }]} />
                    <View>
                      <Text style={styles.txnLabel}>{transactionTypeLabel[txn.transactionType] ?? txn.transactionType}</Text>
                      <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.txnRight}>
                    <Text style={[styles.txnPoints, { color: isPositive ? '#10b981' : '#ef4444' }]}>
                      {`${isPositive ? '+' : '-'}${points} điểm`}
                    </Text>
                    <Text style={styles.txnVnd}>
                      ({isPositive ? '+' : '-'}{formatVnd(Math.abs(txn.amount))})
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LuxeSpacing.lg,
    gap: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '30',
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
  balanceCard: {
    backgroundColor: LuxeColors.primary,
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.xl,
    alignItems: 'center',
  },
  balanceCardTop: {
    alignItems: 'center',
    marginBottom: 8,
  },
  gemIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  balancePoints: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -1,
  },
  balanceUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: -4,
  },
  balanceSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    marginBottom: 16,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: LuxeBorderRadius.full,
    paddingHorizontal: LuxeSpacing.xl,
    paddingVertical: LuxeSpacing.sm,
  },
  topUpBtnText: {
    color: LuxeColors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  pointsRow: {
    flexDirection: 'row',
  },
  pointCard: {
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  pointIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pointLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 4,
    textAlign: 'center',
  },
  pointValue: {
    fontSize: 22,
    fontWeight: '700',
    color: LuxeColors.primary,
  },
  pointSubtext: {
    fontSize: 11,
    color: LuxeColors.outline,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    gap: LuxeSpacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  seeAll: {
    fontSize: 13,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: LuxeSpacing.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  emptyState: {
    alignItems: 'center',
    padding: LuxeSpacing.xl,
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.lg,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  emptyText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 12,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    marginBottom: 8,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  txnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  txnDate: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnPoints: {
    fontSize: 15,
    fontWeight: '700',
  },
  txnVnd: {
    fontSize: 11,
    color: LuxeColors.outline,
    marginTop: 2,
  },
});

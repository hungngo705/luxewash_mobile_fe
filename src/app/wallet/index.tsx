/**
 * Wallet Home Screen
 * Shows wallet balance, points, and actions
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const transactionTypeLabel: Record<string, string> = {
  TopUp: 'Nạp tiền',
  Booking: 'Thanh toán đơn hàng',
  Refund: 'Hoàn tiền',
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
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư ví</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(wallet?.balance ?? walletBalance ?? 0)}
          </Text>
          <TouchableOpacity
            style={styles.topUpBtn}
            onPress={() => router.push('/wallet/top-up')}
          >
            <Text style={styles.topUpBtnText}>+ Nạp tiền</Text>
          </TouchableOpacity>
        </View>

        {/* Points Section */}
        <View style={styles.pointsRow}>
          <View style={[styles.pointCard, { flex: 1 }]}>
            <Text style={styles.pointLabel}>Điểm tích lũy</Text>
            <Text style={styles.pointValue}>{wallet?.totalPoints ?? 0}</Text>
          </View>
          <View style={{ width: LuxeSpacing.md }} />
          <View style={[styles.pointCard, { flex: 1 }]}>
            <Text style={styles.pointLabel}>Điểm khuyến mãi</Text>
            <Text style={[styles.pointValue, { color: '#f59e0b' }]}>{wallet?.promotionPoints ?? 0}</Text>
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
              <View style={[styles.actionIconWrap, { backgroundColor: '#10b98120' }]}>
                <Feather name="plus-circle" size={22} color="#10b981" />
              </View>
              <Text style={styles.actionLabel}>Nạp tiền</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/wallet/transactions')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: LuxeColors.primaryContainer + '30' }]}>
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
              return (
                <View key={txn.transactionId} style={styles.txnItem}>
                  <View style={styles.txnLeft}>
                    <View style={[styles.txnDot, { backgroundColor: transactionTypeColor[txn.transactionType] ?? '#6f787f' }]} />
                    <View>
                      <Text style={styles.txnLabel}>{transactionTypeLabel[txn.transactionType] ?? txn.transactionType}</Text>
                      <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.txnAmount, { color: isPositive ? '#10b981' : '#ef4444' }]} numberOfLines={1}>
                    {`${isPositive ? '+' : '-'}${formatCurrency(Math.abs(txn.amount))}`}
                  </Text>
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
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.xl,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: LuxeColors.onPrimaryContainer,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: LuxeColors.onPrimaryContainer,
    marginVertical: LuxeSpacing.sm,
  },
  topUpBtn: {
    backgroundColor: '#ffffff',
    borderRadius: LuxeBorderRadius.full,
    paddingHorizontal: LuxeSpacing.xl,
    paddingVertical: LuxeSpacing.sm,
  },
  topUpBtnText: {
    color: LuxeColors.primaryContainer,
    fontWeight: '700',
    fontSize: 15,
  },
  pointsRow: {
    flexDirection: 'row',
  },
  pointCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  pointLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 4,
  },
  pointValue: {
    fontSize: 22,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: LuxeBorderRadius.lg,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  emptyText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  },
  txnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});

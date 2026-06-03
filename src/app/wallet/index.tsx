/**
 * Wallet Home Screen
 * Bold professional redesign with gradient balance card and clean solid cards
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, LuxeShadows } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { walletService, type WalletBalance, type Transaction } from '@/services/api';
import { vndToPoints, VND_PER_POINT } from '@/utils/format';
import { Header } from '@/components/ui/Header';

const POINTS_LABEL = 'điểm';

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
  PointReward: '#F59E0B',
  PointRedeem: '#8B5CF6',
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

  const primaryBalance = wallet?.balance ?? walletBalance ?? 0;
  const mainPoints = wallet?.totalPoints || Math.floor(primaryBalance / VND_PER_POINT);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Ví của tôi" onBack={() => router.back()} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Ví của tôi" onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LuxeColors.primaryContainer} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card - Bold Gradient */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Số dư điểm</Text>
              <Text style={styles.balancePoints}>{mainPoints.toLocaleString('vi-VN')}</Text>
              <Text style={styles.balanceUnit}>{POINTS_LABEL}</Text>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceBottomRow}>
            <Text style={styles.balanceSubtitle}>1 điểm = {VND_PER_POINT.toLocaleString('vi-VN')}đ</Text>
            <TouchableOpacity
              style={styles.topUpBtn}
              onPress={() => router.push('/wallet/top-up')}
            >
              <Feather name="plus" size={14} color={LuxeColors.primary} />
              <Text style={styles.topUpBtnText}>Nạp điểm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/top-up')}>
            <View style={[styles.actionIconWrap, { backgroundColor: '#10b98118' }]}>
              <Feather name="plus-circle" size={22} color="#10b981" />
            </View>
            <Text style={styles.actionLabel}>Nạp điểm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/transactions')}>
            <View style={[styles.actionIconWrap, { backgroundColor: LuxeColors.primaryContainer + '18' }]}>
              <Feather name="list" size={22} color={LuxeColors.primaryContainer} />
            </View>
            <Text style={styles.actionLabel}>Lịch sử</Text>
          </TouchableOpacity>
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
              <View style={styles.emptyIconWrap}>
                <Feather name="inbox" size={40} color={LuxeColors.outlineVariant} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptySubtitle}>Nạp điểm để bắt đầu sử dụng</Text>
            </View>
          ) : (
            <View style={styles.txnList}>
              {recentTxns.map((txn) => {
                const isPositive = txn.transactionType === 'TopUp' || txn.transactionType === 'Refund' || txn.transactionType === 'PointReward';
                const points = vndToPoints(Math.abs(txn.amount));
                const color = transactionTypeColor[txn.transactionType] ?? '#6f787f';
                return (
                  <View key={txn.transactionId} style={styles.txnItem}>
                    <View style={styles.txnLeft}>
                      <View style={[styles.txnDot, { backgroundColor: color }]} />
                      <View>
                        <Text style={styles.txnLabel}>
                          {transactionTypeLabel[txn.transactionType] ?? txn.transactionType}
                        </Text>
                        <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.txnRight}>
                      <Text style={[styles.txnPoints, { color }]}>
                        {`${isPositive ? '+' : '-'}${points}`}
                      </Text>
                      <Text style={styles.txnUnit}>{POINTS_LABEL}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },
  balanceCard: {
    backgroundColor: LuxeColors.primary,
    borderRadius: 24,
    padding: 24,
    ...LuxeShadows.lg,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 4 },
  balancePoints: {
    fontSize: 48, fontWeight: '800', color: '#fff',
    letterSpacing: -1, lineHeight: 54,
  },
  balanceUnit: { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: -4 },
  balanceIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
  balanceBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  topUpBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: LuxeBorderRadius.full,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  topUpBtnText: { fontSize: 14, fontWeight: '700', color: LuxeColors.primary },
  pointsRow: { flexDirection: 'row' },
  pointCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...LuxeShadows.sm,
  },
  pointIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  pointLabel: {
    fontSize: 12, color: LuxeColors.onSurfaceVariant,
    marginBottom: 4, textAlign: 'center', fontWeight: '500',
  },
  pointValue: {
    fontSize: 22, fontWeight: '800', color: LuxeColors.primary,
    marginBottom: 2,
  },
  pointSubtext: { fontSize: 11, color: LuxeColors.outline, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 14 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...LuxeShadows.sm,
  },
  actionIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: LuxeColors.onSurface },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: LuxeColors.onSurface },
  seeAll: { fontSize: 13, color: LuxeColors.primaryContainer, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    ...LuxeShadows.sm,
  },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: LuxeColors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: LuxeColors.onSurface, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: LuxeColors.onSurfaceVariant },
  txnList: { gap: 10 },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    ...LuxeShadows.sm,
  },
  txnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txnDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  txnLabel: { fontSize: 14, fontWeight: '700', color: LuxeColors.onSurface },
  txnDate: { fontSize: 12, color: LuxeColors.onSurfaceVariant, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnPoints: { fontSize: 16, fontWeight: '800' },
  txnUnit: { fontSize: 11, color: LuxeColors.onSurfaceVariant, marginTop: 2 },
});

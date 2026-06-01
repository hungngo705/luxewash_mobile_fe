/**
 * Transaction History Screen
 * GET /api/v1/transactions
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { walletService, type Transaction } from '@/services/api';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  TopUp: { label: 'Nạp tiền', color: '#10b981', icon: 'plus-circle' },
  Refund: { label: 'Hoàn tiền', color: '#10b981', icon: 'rotate-ccw' },
  Booking: { label: 'Thanh toán đơn hàng', color: '#ef4444', icon: 'truck' },
  Upsell: { label: 'Phụ phí', color: '#ef4444', icon: 'plus-square' },
  PointReward: { label: 'Tích điểm', color: '#f59e0b', icon: 'star' },
  PointRedeem: { label: 'Đổi điểm', color: '#8b5cf6', icon: 'gift' },
};

export default function TransactionsScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await walletService.getTransactions();
      if (res.statusCode === 200 && res.data) {
        setTransactions(res.data);
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPositive = (txn: Transaction) =>
    txn.transactionType === 'TopUp' || txn.transactionType === 'Refund' || txn.transactionType === 'PointReward';

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={LuxeColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={styles.placeholder} />
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="inbox" size={48} color={LuxeColors.outlineVariant} />
          <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
          <Text style={styles.emptySubtitle}>
            Các giao dịch nạp tiền, thanh toán và hoàn tiền sẽ hiển thị ở đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.transactionId)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={LuxeColors.primaryContainer}
            />
          }
          renderItem={({ item: txn }) => {
            const config = typeConfig[txn.transactionType] ?? { label: txn.transactionType, color: '#6f787f', icon: 'circle' };
            const positive = isPositive(txn);

            return (
              <View style={styles.txnCard}>
                <View style={styles.txnHeader}>
                  <View style={styles.txnLeft}>
                    <View style={[styles.txnIconWrap, { backgroundColor: config.color + '20' }]}>
                      <Feather name={config.icon as any} size={16} color={config.color} />
                    </View>
                    <View>
                      <Text style={styles.txnLabel}>{config.label}</Text>
                      {txn.referenceId && (
                        <Text style={styles.txnRef}>#{txn.referenceId}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.txnRight}>
                    <Text style={[styles.txnAmount, { color: positive ? config.color : '#ef4444' }]}>
                      {positive ? '+' : '-'}{formatCurrency(Math.abs(txn.amount))}
                    </Text>
                    <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                  </View>
                </View>
                {txn.description && (
                  <Text style={styles.txnDesc}>{txn.description}</Text>
                )}
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LuxeSpacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  txnCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  txnRef: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  txnDate: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  txnDesc: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 8,
    marginLeft: 52,
    lineHeight: 18,
  },
});

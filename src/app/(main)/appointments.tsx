/**
 * Appointments Screen
 * Shows user's booking history and upcoming appointments
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type BookingDetail } from '@/services/api';

type TabType = 'all' | 'pending' | 'completed';

const statusMap: Record<string, string> = {
  Pending: 'pending',
  Confirmed: 'pending',
  CheckedIn: 'pending',
  InProgress: 'pending',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'cancelled',
};

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getMyBookings();
        if (res.statusCode === 200 && res.data) {
          setBookings(res.data);
        }
      } catch (e) {
        console.error('Failed to load bookings:', e);
      }
      setLoading(false);
    };
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return statusMap[b.status] === 'pending';
    if (activeTab === 'completed') return statusMap[b.status] === 'completed' || statusMap[b.status] === 'cancelled';
    return true;
  });

  const getStatusStyle = (status: string) => {
    const mapped = statusMap[status] || status;
    switch (mapped) {
      case 'completed':
        return { bg: LuxeColors.primary + '10', text: LuxeColors.primary, dot: LuxeColors.primary };
      case 'pending':
        return { bg: LuxeColors.tertiaryContainer + '30', text: LuxeColors.tertiary, dot: LuxeColors.tertiary };
      case 'cancelled':
        return { bg: LuxeColors.surfaceContainer, text: LuxeColors.onSurfaceVariant, dot: LuxeColors.onSurfaceVariant };
      default:
        return { bg: LuxeColors.surfaceContainer, text: LuxeColors.onSurfaceVariant, dot: LuxeColors.onSurfaceVariant };
    }
  };

  const getStatusLabel = (status: string) => {
    const mapped = statusMap[status] || status;
    switch (mapped) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang chờ';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (timeRange: string) => {
    return timeRange.split(' - ')[0] || '';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch hẹn</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['all', 'pending', 'completed'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? 'Tất cả' : tab === 'pending' ? 'Đang chờ' : 'Hoàn thành'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color={LuxeColors.primaryContainer} style={{ marginTop: 40 }} />
          ) : filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Chưa có lịch hẹn nào</Text>
              <TouchableOpacity style={styles.emptyActionBtn}>
                <Text style={styles.emptyActionBtnText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredBookings.map((booking) => {
              const statusStyle = getStatusStyle(booking.status);
              const date = formatDate(booking.scheduledDate);
              const time = formatTime(booking.timeRange);
              const mainVehicle = booking.vehicles[0];
              return (
                <View key={booking.bookingId} style={styles.appointmentCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.appointmentDate}>{date} • {time}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {getStatusLabel(booking.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.vehicleRow}>
                    <View style={styles.vehicleImage} />
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>{mainVehicle?.vehicleType || 'Xe'} - {mainVehicle?.licensePlate || ''}</Text>
                      <Text style={styles.vehiclePlate}>{mainVehicle?.serviceName || ''}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceLabel}>Tổng cộng</Text>
                      <Text style={styles.serviceName}>
                        {booking.vehicles.length} xe • {booking.finalAmount.toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                    <Text style={[
                      styles.serviceAmount,
                      statusMap[booking.status] === 'cancelled' && styles.serviceAmountCancelled
                    ]}>
                      {booking.finalAmount.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: LuxeSpacing.lg,
    gap: LuxeSpacing.sm,
    marginBottom: LuxeSpacing.md,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: LuxeColors.surfaceContainer,
  },
  tabActive: {
    backgroundColor: LuxeColors.primaryContainer + '20',
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurfaceVariant,
  },
  tabTextActive: {
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  appointmentDate: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  vehicleImage: {
    width: 64,
    height: 64,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.surfaceVariant,
  },
  vehicleInfo: {
    marginLeft: LuxeSpacing.md,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  vehiclePlate: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginBottom: LuxeSpacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  serviceInfo: {},
  serviceLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  serviceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  serviceAmountCancelled: {
    color: LuxeColors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: LuxeBorderRadius.md,
  },
  emptyActionBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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
          setBookings(Array.isArray(res.data) ? res.data : []);
        } else {
          setBookings([]);
        }
      } catch (e) {
        console.error('Failed to load bookings:', e);
      }
      setLoading(false);
    };
    loadBookings();
  }, []);

  const filteredBookings = (bookings || []).filter((b) => {
    if (!b) return false;
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

  const formatTime = (isoDateStr: string) => {
    if (!isoDateStr) return '';
    const date = new Date(isoDateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
              <Feather name="calendar" size={48} color={LuxeColors.outlineVariant} />
              <Text style={styles.emptyText}>Chưa có lịch hẹn nào</Text>
              <TouchableOpacity style={styles.emptyActionBtn}>
                <Text style={styles.emptyActionBtnText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredBookings.map((booking) => {
              if (!booking) return null;
              const statusStyle = getStatusStyle(booking.status || 'unknown');
              const date = booking.scheduledDate ? formatDate(booking.scheduledDate) : '';
              const time = booking.scheduledDate ? formatTime(booking.scheduledDate) : '';

              // Support both flat API (licensePlate/serviceName) and nested API (vehicles[0])
              const mainVehicle = (booking as any).vehicles?.[0];
              const hasNestedVehicles = !!mainVehicle;

              // Prefer nested vehicle data, else use top-level licensePlate + map from user vehicle list
              const apiPlate = (booking as any).licensePlate || '';
              const userVehicle = !hasNestedVehicles && apiPlate
                ? (user?.vehicles || []).find((v) => v.licensePlate === apiPlate)
                : null;

              const vehicleDisplay = hasNestedVehicles
                ? (mainVehicle?.carModel || mainVehicle?.vehicleType || 'Xe')
                : (userVehicle?.model || userVehicle?.brand || 'Xe');
              const vehiclePlate = hasNestedVehicles
                ? (mainVehicle?.licensePlate || '')
                : apiPlate;
              const vehicleImage = hasNestedVehicles
                ? mainVehicle?.registrationPhotoUrl
                : (userVehicle?.imageUrl || undefined);
              const vehicleType = hasNestedVehicles
                ? (mainVehicle?.vehicleType || '')
                : (userVehicle?.brand || '');
              const vehicleCount = hasNestedVehicles ? ((booking as any).vehicles?.length || 0) : (vehiclePlate ? 1 : 0);
              return (
                <View key={String(booking.bookingId || 'unknown')} style={styles.appointmentCard}>
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
                    {vehicleImage ? (
                      <Image source={{ uri: vehicleImage }} style={styles.vehicleImage} />
                    ) : (
                      <View style={[styles.vehicleImage, styles.vehicleImagePlaceholder]}>
                        <Feather name="truck" size={24} color={LuxeColors.onSurfaceVariant} />
                      </View>
                    )}
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>{vehicleDisplay}</Text>
                      {vehicleType && vehicleDisplay !== vehicleType && (
                        <Text style={styles.vehicleTypeLabel}>{vehicleType}</Text>
                      )}
                      <View style={styles.vehiclePlateBadge}>
                        <Text style={styles.vehiclePlate}>{vehiclePlate}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceLabel}>Tổng cộng</Text>
                      <Text style={styles.serviceName}>
                        {vehicleCount} xe • {(booking.finalAmount || 0).toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                    <Text style={[
                      styles.serviceAmount,
                      statusMap[booking.status] === 'cancelled' && styles.serviceAmountCancelled
                    ]}>
                      {(booking.finalAmount || 0).toLocaleString('vi-VN')}đ
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
    flexShrink: 0,
  },
  vehicleImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: LuxeSpacing.md,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  vehicleTypeLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 4,
  },
  vehiclePlateBadge: {
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  vehiclePlate: {
    fontSize: 12,
    fontWeight: '800',
    color: LuxeColors.primaryContainer,
    letterSpacing: 0.5,
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
  emptyIconContainer: {
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

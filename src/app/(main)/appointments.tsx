/**
 * Appointments Screen
 * Shows user's booking history and upcoming appointments
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { mockBookings } from '@/data/types';

type TabType = 'all' | 'upcoming' | 'completed';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Mock appointment data
  const appointments = [
    {
      id: '1',
      date: '15/10/2024',
      time: '10:00',
      vehicle: 'Mercedes-Benz S500',
      plate: '30A-888.88',
      service: 'Rửa xe cao cấp + Phủ Ceramic',
      status: 'completed',
      amount: '1.000.000đ',
    },
    {
      id: '2',
      date: '02/10/2024',
      time: '09:00',
      vehicle: 'Porsche Taycan',
      plate: '51F-999.99',
      service: 'Vệ sinh nội thất chuyên sâu',
      status: 'completed',
      amount: '500.000đ',
    },
    {
      id: '3',
      date: '28/09/2024',
      time: '16:00',
      vehicle: 'Mercedes-Benz S500',
      plate: '30A-888.88',
      service: 'Rửa xe tiêu chuẩn',
      status: 'cancelled',
      amount: '300.000đ',
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: LuxeColors.primary + '10', text: LuxeColors.primary, dot: LuxeColors.primary };
      case 'upcoming':
        return { bg: LuxeColors.tertiaryContainer + '30', text: LuxeColors.tertiary, dot: LuxeColors.tertiary };
      case 'cancelled':
        return { bg: LuxeColors.surfaceContainer, text: LuxeColors.onSurfaceVariant, dot: LuxeColors.onSurfaceVariant };
      default:
        return { bg: LuxeColors.surfaceContainer, text: LuxeColors.onSurfaceVariant, dot: LuxeColors.onSurfaceVariant };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'upcoming': return 'Sắp tới';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
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
          {(['all', 'upcoming', 'completed'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? 'Tất cả' : tab === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {appointments.map((appointment) => {
            const statusStyle = getStatusStyle(appointment.status);
            return (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.appointmentDate}>{appointment.date} • {appointment.time}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {getStatusLabel(appointment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleImage} />
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{appointment.vehicle}</Text>
                    <Text style={styles.vehiclePlate}>{appointment.plate}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceLabel}>Dịch vụ</Text>
                    <Text style={styles.serviceName}>{appointment.service}</Text>
                  </View>
                  <Text style={[
                    styles.serviceAmount,
                    appointment.status === 'cancelled' && styles.serviceAmountCancelled
                  ]}>
                    {appointment.amount}
                  </Text>
                </View>
              </View>
            );
          })}
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
});

/**
 * Vehicles List Screen
 * Shows all vehicles belonging to the logged-in customer
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/data/types';

export default function VehiclesScreen() {
  const router = useRouter();
  const { user, removeVehicle } = useAuth();
  const vehicles = user?.vehicles || [];

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      'Xóa xe',
      `Bạn có chắc muốn xóa xe ${vehicle.licensePlate}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const success = removeVehicle(vehicle.id);
            if (!success) {
              Alert.alert('Lỗi', 'Không thể xóa xe. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xe của tôi</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/vehicles/add-vehicle')}
        >
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>Chưa có xe nào</Text>
            <Text style={styles.emptyText}>
              Thêm xe của bạn để đặt lịch rửa xe dễ dàng hơn
            </Text>
            <TouchableOpacity
              style={styles.addVehicleBtn}
              onPress={() => router.push('/vehicles/add-vehicle')}
            >
              <Text style={styles.addVehicleBtnText}>+ Thêm xe mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.vehicleList}>
            {vehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <View style={styles.vehicleImageContainer}>
                  {vehicle.imageUrl ? (
                    <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleImage} />
                  ) : (
                    <View style={styles.vehicleImagePlaceholder}>
                      <Text style={styles.vehicleImagePlaceholderText}>🚗</Text>
                    </View>
                  )}
                </View>
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteVehicle(vehicle)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.vehicleDetails}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text style={styles.vehicleColor}>Màu: {vehicle.color}</Text>
                </View>
              </View>
            ))}

            {vehicles.length < 5 && (
              <TouchableOpacity
                style={styles.addMoreCard}
                onPress={() => router.push('/vehicles/add-vehicle')}
              >
                <Text style={styles.addMoreIcon}>+</Text>
                <Text style={styles.addMoreText}>Thêm xe mới</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.limitNote}>
              Tối đa 5 xe mỗi tài khoản
            </Text>
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
  backIcon: {
    fontSize: 24,
    color: LuxeColors.onSurface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  addBtn: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.xs,
    backgroundColor: LuxeColors.primaryContainer + '20',
    borderRadius: LuxeBorderRadius.md,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LuxeSpacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LuxeSpacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: LuxeSpacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: LuxeSpacing.lg,
    paddingHorizontal: LuxeSpacing.lg,
  },
  addVehicleBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.md,
    borderRadius: LuxeBorderRadius.md,
  },
  addVehicleBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  vehicleList: {
    gap: LuxeSpacing.md,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  vehicleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: LuxeBorderRadius.md,
    overflow: 'hidden',
    marginRight: LuxeSpacing.md,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: LuxeColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleImagePlaceholderText: {
    fontSize: 32,
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  vehicleDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  vehicleColor: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },
  addMoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: LuxeColors.outlineVariant,
    gap: LuxeSpacing.sm,
  },
  addMoreIcon: {
    fontSize: 24,
    color: LuxeColors.primaryContainer,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  limitNote: {
    textAlign: 'center',
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: LuxeSpacing.md,
  },
});

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/data/types';
import { useConfirmDialog } from '@/components/ConfirmDialog';

export default function VehiclesScreen() {
  const router = useRouter();
  const { user, removeVehicle } = useAuth();
  const vehicles = user?.vehicles || [];
  const { confirm } = useConfirmDialog();

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    confirm({
      title: 'Xóa xe',
      message: `Bạn có chắc muốn xóa xe ${vehicle.licensePlate}?`,
      confirmText: 'Xóa',
      destructive: true,
      onConfirm: async () => {
        const result = await removeVehicle(vehicle.licensePlate);
        if (!result.success) {
          // Show error using a simple Alert (non-blocking)
          alert(result.error || 'Không thể xóa xe. Vui lòng thử lại.');
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(main)' as any);
          }
        }}>
          <Feather name="chevron-left" size={24} color={LuxeColors.onSurface} />
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
            <View style={styles.emptyIconWrap}>
              <Feather name="truck" size={48} color={LuxeColors.outlineVariant} />
            </View>
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
                      <Feather name="truck" size={36} color={LuxeColors.onSurfaceVariant} />
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
                      <Feather name="trash-2" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.vehicleCarModel}>{vehicle.model || vehicle.brand}</Text>
                  {vehicle.model && (
                    <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
                  )}
                  <View style={styles.vehicleBadges}>
                    <View style={styles.vehicleTypeBadge}>
                      <Feather name="tag" size={11} color={LuxeColors.primaryContainer} />
                      <Text style={styles.vehicleTypeText}>{vehicle.brand}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {vehicles.length < 5 && (
              <TouchableOpacity
                style={styles.addMoreCard}
                onPress={() => router.push('/vehicles/add-vehicle')}
              >
                <View style={styles.addMoreIconWrap}>
                  <Feather name="plus" size={18} color={LuxeColors.primaryContainer} />
                </View>
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
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LuxeColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '800',
    color: LuxeColors.primaryContainer,
    letterSpacing: 0.5,
  },
  vehicleCarModel: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginTop: 2,
  },
  vehicleBrand: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 1,
    marginBottom: 6,
  },
  vehicleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  vehicleTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vehicleTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  deleteBtn: {
    padding: 4,
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
  addMoreIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
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

/**
 * Advance Booking Flow - Step 3: Select Vehicle(s)
 * After service + date/time are chosen, user selects their vehicle(s)
 * Supports 1-5 vehicles per booking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/data/types';

const MAX_VEHICLES = 5;

export default function SelectVehicleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const serviceIdParam = (params.serviceId as string) || '';
  const serviceNameParam = (params.serviceName as string) || '';
  const servicePriceParam = parseInt(params.servicePrice as string) || 0;
  const membershipDiscountParam = parseFloat(params.membershipDiscount as string) || 0;
  const dateParam = (params.date as string) || '';
  const slotIdParam = (params.slotId as string) || '';
  const timeRangeParam = (params.timeRange as string) || '';

  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const vehicles = user?.vehicles || [];

  const toggleVehicle = (vehicle: Vehicle) => {
    const isSelected = selectedVehicles.some(v => v.licensePlate === vehicle.licensePlate);
    if (isSelected) {
      setSelectedVehicles(selectedVehicles.filter(v => v.licensePlate !== vehicle.licensePlate));
    } else {
      if (selectedVehicles.length >= MAX_VEHICLES) {
        alert(`Tối đa ${MAX_VEHICLES} xe mỗi lần đặt lịch`);
        return;
      }
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const handleContinue = () => {
    if (selectedVehicles.length === 0) {
      alert('Vui lòng chọn ít nhất 1 xe');
      return;
    }

    const licensePlates = selectedVehicles.map(v => v.licensePlate).join(',');
    const vehicleTypeIds = selectedVehicles.map(v => String(v.vehicleTypeId ?? 1)).join(',');
    const vehicleBrands = selectedVehicles.map(v => `${v.brand}${v.model ? ` · ${v.model}` : ''}`).join(', ');

    router.push({
      pathname: '/booking/confirmation',
      params: {
        serviceId: serviceIdParam,
        serviceName: serviceNameParam,
        servicePrice: String(servicePriceParam),
        membershipDiscount: String(membershipDiscountParam),
        date: dateParam,
        slotId: slotIdParam,
        timeRange: timeRangeParam,
        vehicleIds: licensePlates,
        vehicleTypeIds,
        vehicleBrands,
      },
    });
  };

  const handleAddVehicle = () => {
    router.push('/vehicles/add-vehicle');
  };

  const totalPrice = selectedVehicles.length * servicePriceParam;
  const totalDiscount = Math.round(totalPrice * membershipDiscountParam);
  const finalTotal = Math.max(0, totalPrice - totalDiscount);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch rửa xe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="droplet" size={18} color={LuxeColors.primaryContainer} />
            <Text style={styles.summaryText}>{serviceNameParam}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="calendar" size={18} color={LuxeColors.primaryContainer} />
            <Text style={styles.summaryText}>{dateParam} • {timeRangeParam}</Text>
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Chọn xe ({selectedVehicles.length}/{MAX_VEHICLES})
            </Text>
            {vehicles.length < MAX_VEHICLES && (
              <TouchableOpacity style={styles.addVehicleBtn} onPress={handleAddVehicle}>
                <Text style={styles.addVehicleText}>Thêm xe mới</Text>
                <Text style={styles.addVehicleIcon}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="truck" size={48} color={LuxeColors.outlineVariant} />
              <Text style={styles.emptyText}>Bạn chưa có xe nào</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAddVehicle}>
                <Text style={styles.emptyAddBtnText}>+ Thêm xe mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.vehicleList}>
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicles.some(v => v.licensePlate === vehicle.licensePlate);
                return (
                  <TouchableOpacity
                    key={vehicle.licensePlate}
                    style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                    onPress={() => toggleVehicle(vehicle)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedIcon}>✓</Text>
                      </View>
                    )}
                    <View style={styles.vehicleImageContainer}>
                      {vehicle.imageUrl ? (
                        <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleImage} />
                      ) : (
                        <View style={styles.vehicleImagePlaceholder}>
                          <Feather name="truck" size={32} color={LuxeColors.onSurfaceVariant} />
                        </View>
                      )}
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>{vehicle.brand}{vehicle.model ? ` · ${vehicle.model}` : ''}</Text>
                      <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.vehiclePriceTag}>
                        <Text style={styles.vehiclePriceTagText}>
                          {servicePriceParam.toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Selected Summary */}
        {selectedVehicles.length > 0 && (
          <View style={styles.selectedSummaryCard}>
            <Text style={styles.selectedSummaryTitle}>Xe đã chọn:</Text>
            {selectedVehicles.map((v) => (
              <Text key={v.licensePlate} style={styles.selectedSummaryItem}>
                • {v.licensePlate} — {v.brand}{v.model ? ` · ${v.model}` : ''}
              </Text>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Tổng ({selectedVehicles.length} xe)</Text>
              {membershipDiscountParam > 0 && (
                <Text style={styles.summaryTotalOriginal}>
                  {totalPrice.toLocaleString('vi-VN')}đ
                </Text>
              )}
              <Text style={styles.summaryTotalValue}>
                {finalTotal.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            {membershipDiscountParam > 0 && (
              <Text style={styles.discountNote}>
                Tiết kiệm {totalDiscount.toLocaleString('vi-VN')}đ nhờ ưu đãi thành viên
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.continueBtn, selectedVehicles.length === 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={selectedVehicles.length === 0}
          activeOpacity={0.9}
        >
          <Text style={styles.continueBtnText}>
            XÁC NHẬN ({selectedVehicles.length} xe)
          </Text>
          <Text style={styles.continueBtnIcon}>→</Text>
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    alignItems: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: LuxeColors.primaryContainer,
    borderWidth: 2,
    borderColor: LuxeColors.primary,
  },
  progressDotCompleted: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressDotPending: {
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLineCompleted: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.md,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginTop: LuxeSpacing.sm,
    marginBottom: LuxeSpacing.lg,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: LuxeColors.onSurface,
    fontWeight: '500',
  },
  section: {
    marginBottom: LuxeSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addVehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  addVehicleIcon: {
    fontSize: 16,
    color: LuxeColors.primaryContainer,
  },
  emptyState: {
    alignItems: 'center',
    padding: LuxeSpacing.xl * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: LuxeBorderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: LuxeColors.outlineVariant,
  },
  emptyIconContainer: {
    marginBottom: LuxeSpacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: LuxeSpacing.md,
  },
  emptyAddBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.sm,
    borderRadius: LuxeBorderRadius.md,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  vehicleList: {
    gap: LuxeSpacing.md,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  vehicleCardSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '08',
    shadowColor: LuxeColors.primaryContainer,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectedIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  vehicleImageContainer: {
    width: 56,
    height: 56,
    borderRadius: LuxeBorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: LuxeColors.surfaceContainerHighest,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: LuxeSpacing.md,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
    marginTop: 2,
  },
  vehiclePriceTag: {
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vehiclePriceTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  selectedSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1.5,
    borderColor: LuxeColors.primaryContainer + '30',
  },
  selectedSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 8,
  },
  selectedSummaryItem: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginVertical: LuxeSpacing.sm,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTotalLabel: {
    flex: 1,
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },
  summaryTotalOriginal: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  discountNote: {
    fontSize: 12,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '20',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  continueBtnDisabled: {
    backgroundColor: LuxeColors.surfaceVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  continueBtnIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
});

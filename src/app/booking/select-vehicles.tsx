/**
 * Advance Booking Flow - Step 1: Select Vehicle(s)
 * Bold professional redesign with solid white cards
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, LuxeShadows } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/data/types';
import { Header } from '@/components/ui/Header';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { BottomActionBar } from '@/components/ui/BottomActionBar';

const MAX_VEHICLES = 5;

export default function SelectVehiclesScreen() {
  const router = useRouter();
  const { user } = useAuth();

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
    const vehicleBrands = selectedVehicles.map(v => `${v.brand}${v.model ? ` · ${v.model}` : ''}`).join('|');

    router.push({
      pathname: '/booking/select-service',
      params: { vehicleIds: licensePlates, vehicleTypeIds, vehicleBrands },
    });
  };

  const handleAddVehicle = () => router.push('/vehicles/add-vehicle');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Đặt lịch rửa xe" onBack={() => router.back()} />

        <ProgressSteps
          steps={[
            { label: 'Xe' },
            { label: 'Dịch vụ' },
            { label: 'Ngày' },
            { label: 'Xác nhận' },
          ]}
          currentStep={0}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Chọn xe của bạn</Text>
            <Text style={styles.welcomeSubtitle}>
              Chọn tối đa {MAX_VEHICLES} xe để đặt lịch rửa
            </Text>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Xe của tôi ({selectedVehicles.length}/{MAX_VEHICLES})
            </Text>
            {vehicles.length < MAX_VEHICLES && (
              <TouchableOpacity style={styles.addVehicleBtn} onPress={handleAddVehicle}>
                <Feather name="plus" size={14} color={LuxeColors.primaryContainer} />
                <Text style={styles.addVehicleText}>Thêm xe</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Vehicle List */}
          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="truck" size={40} color={LuxeColors.outlineVariant} />
              </View>
              <Text style={styles.emptyTitle}>Bạn chưa có xe nào</Text>
              <Text style={styles.emptySubtitle}>Thêm xe để đặt lịch rửa xe</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAddVehicle}>
                <Feather name="plus" size={16} color="#fff" />
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
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    )}
                    <View style={styles.vehicleImageWrap}>
                      {vehicle.imageUrl ? (
                        <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleImage} />
                      ) : (
                        <View style={styles.vehicleImagePlaceholder}>
                          <Feather name="truck" size={28} color={LuxeColors.outline} />
                        </View>
                      )}
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>
                        {vehicle.model ? `${vehicle.brand} · ${vehicle.model}` : vehicle.brand}
                      </Text>
                      <View style={styles.plateBadge}>
                        <Text style={styles.plateText}>{vehicle.licensePlate}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Selected Summary */}
          {selectedVehicles.length > 0 && (
            <View style={styles.selectedSummary}>
              <View style={styles.selectedSummaryHeader}>
                <Feather name="check-circle" size={18} color={LuxeColors.primaryContainer} />
                <Text style={styles.selectedSummaryTitle}>
                  Đã chọn {selectedVehicles.length} xe
                </Text>
              </View>
              {selectedVehicles.map((v) => (
                <Text key={v.licensePlate} style={styles.selectedItem}>
                  • {v.licensePlate} — {v.model ? `${v.brand} · ${v.model}` : v.brand}
                </Text>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        <BottomActionBar
          title={`TIẾP THEO (${selectedVehicles.length} xe)`}
          onPress={handleContinue}
          disabled={selectedVehicles.length === 0}
          icon="arrow-right"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  welcomeSection: { marginBottom: 20 },
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: LuxeColors.onSurface, marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: LuxeColors.onSurfaceVariant },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: LuxeColors.onSurface },
  addVehicleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: LuxeColors.primaryContainer + '18', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  addVehicleText: { fontSize: 13, fontWeight: '600', color: LuxeColors.primaryContainer },
  emptyState: { alignItems: 'center', padding: 32, backgroundColor: '#ffffff', borderRadius: 20, ...LuxeShadows.sm },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: LuxeColors.surfaceContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: LuxeColors.onSurface, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: LuxeColors.onSurfaceVariant, marginBottom: 20 },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: LuxeColors.primaryContainer, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, ...LuxeShadows.primary },
  emptyAddBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  vehicleList: { gap: 12 },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...LuxeShadows.sm,
  },
  vehicleCardSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '08',
    ...LuxeShadows.md,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  vehicleImageWrap: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', backgroundColor: LuxeColors.surfaceContainer },
  vehicleImage: { width: '100%', height: '100%' },
  vehicleImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { flex: 1, marginLeft: 14 },
  vehicleName: { fontSize: 16, fontWeight: '700', color: LuxeColors.onSurface, marginBottom: 8 },
  plateBadge: { backgroundColor: LuxeColors.primaryContainer + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  plateText: { fontSize: 13, fontWeight: '800', color: LuxeColors.primaryContainer, letterSpacing: 0.5 },
  selectedSummary: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginTop: 20, ...LuxeShadows.sm },
  selectedSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  selectedSummaryTitle: { fontSize: 14, fontWeight: '700', color: LuxeColors.onSurface },
  selectedItem: { fontSize: 13, color: LuxeColors.onSurfaceVariant, marginBottom: 4, marginLeft: 4 },
});

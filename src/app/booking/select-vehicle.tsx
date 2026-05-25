/**
 * Advance Booking Flow - Step 1: Select Vehicle
 * Allows user to select a vehicle for booking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { mockVehicles, Vehicle } from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SelectVehicleScreenProps {
  onSelect?: (vehicle: Vehicle) => void;
  onBack?: () => void;
}

export default function SelectVehicleScreen({ onSelect, onBack }: SelectVehicleScreenProps) {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(mockVehicles[0]);

  const handleContinue = () => {
    if (selectedVehicle) {
      if (onSelect) {
        onSelect(selectedVehicle);
      }
      router.push({
        pathname: '/booking/select-date',
        params: { vehicleId: selectedVehicle.id },
      });
    }
  };

  const handleAddVehicle = () => {
    // Navigate to add vehicle screen - placeholder
    console.log('Add vehicle pressed');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onBack ? onBack() : router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch rửa xe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Section: Select Vehicle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chọn xe của bạn</Text>
            <TouchableOpacity style={styles.addVehicleBtn} onPress={handleAddVehicle}>
              <Text style={styles.addVehicleText}>Thêm xe mới</Text>
              <Text style={styles.addVehicleIcon}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleList}>
            {mockVehicles.map((vehicle, index) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                  onPress={() => setSelectedVehicle(vehicle)}
                >
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedIcon}>✓</Text>
                    </View>
                  )}
                  <View style={styles.vehicleImageContainer}>
                    <Image
                      source={{ uri: vehicle.imageUrl || 'https://via.placeholder.com/64' }}
                      style={styles.vehicleImage}
                    />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
                    <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedVehicle && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedVehicle}
        >
          <Text style={styles.continueBtnText}>TIẾP TỤC</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: LuxeColors.onSurfaceVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
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
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  progressDotPending: {
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.md,
    paddingBottom: 100,
  },
  section: {
    marginTop: LuxeSpacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  sectionTitle: {
    fontSize: 20,
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
  vehicleList: {
    gap: LuxeSpacing.md,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    position: 'relative',
  },
  vehicleCardSelected: {
    borderWidth: 2,
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: 'rgba(74, 169, 215, 0.1)',
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
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  vehicleImageContainer: {
    width: 64,
    height: 64,
    borderRadius: LuxeBorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: LuxeColors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
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
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(247, 249, 251, 0.9)',
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

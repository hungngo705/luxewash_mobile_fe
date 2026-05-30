/**
 * Add Vehicle Screen
 * Allows customers to add a new vehicle to their account
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/data/types';

const CAR_BRANDS = [
  { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { label: 'BMW', value: 'BMW' },
  { label: 'Audi', value: 'Audi' },
  { label: 'Porsche', value: 'Porsche' },
  { label: 'Lexus', value: 'Lexus' },
  { label: 'Toyota', value: 'Toyota' },
  { label: 'Honda', value: 'Honda' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Mazda', value: 'Mazda' },
  { label: 'Hyundai', value: 'Hyundai' },
  { label: 'Kia', value: 'Kia' },
  { label: 'VinFast', value: 'VinFast' },
  { label: 'Other', value: 'Other' },
];

const CAR_COLORS = [
  { label: 'Đen', value: 'Đen' },
  { label: 'Trắng', value: 'Trắng' },
  { label: 'Xám', value: 'Xám' },
  { label: 'Bạc', value: 'Bạc' },
  { label: 'Đỏ', value: 'Đỏ' },
  { label: 'Xanh', value: 'Xanh' },
  { label: 'Nâu', value: 'Nâu' },
  { label: 'Vàng', value: 'Vàng' },
  { label: 'Cam', value: 'Cam' },
  { label: 'Khác', value: 'Khác' },
];

export default function AddVehicleScreen() {
  const router = useRouter();
  const { user, addVehicle } = useAuth();

  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const validateLicensePlate = (plate: string): boolean => {
    const pattern = /^[0-9]{2}[A-Z]-[0-9]{3,4}\.[0-9]{2}$/;
    return pattern.test(plate);
  };

  const formatLicensePlate = (text: string): string => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}.${cleaned.slice(5, 7)}`;
  };

  const handlePlateChange = (text: string) => {
    setLicensePlate(formatLicensePlate(text));
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập biển số xe');
      return;
    }

    if (!validateLicensePlate(licensePlate)) {
      Alert.alert('Lỗi', 'Biển số không đúng định dạng (VD: 30A-888.88)');
      return;
    }

    if (!brand.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn hãng xe');
      return;
    }

    if (!model.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập dòng xe');
      return;
    }

    if (!color.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn màu xe');
      return;
    }

    setIsSubmitting(true);

    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      licensePlate: licensePlate.toUpperCase(),
      brand,
      model,
      color,
      userId: user!.id,
      createdAt: new Date(),
    };

    const success = addVehicle(newVehicle);

    if (success) {
      Alert.alert('Thành công', 'Xe đã được thêm vào tài khoản', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Lỗi', 'Không thể thêm xe. Vui lòng thử lại.');
    }

    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm xe mới</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biển số xe *</Text>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={handlePlateChange}
              placeholder="VD: 30A-888.88"
              placeholderTextColor={LuxeColors.onSurfaceVariant}
              maxLength={11}
              autoCapitalize="characters"
            />
            <Text style={styles.hint}>Format: 00A-000.00</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hãng xe *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowBrandPicker(!showBrandPicker)}
            >
              <Text style={[styles.pickerText, !brand && styles.pickerPlaceholder]}>
                {brand || 'Chọn hãng xe'}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {showBrandPicker && (
              <View style={styles.pickerList}>
                {CAR_BRANDS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.pickerItem, brand === item.value && styles.pickerItemSelected]}
                    onPress={() => {
                      setBrand(item.value);
                      setShowBrandPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, brand === item.value && styles.pickerItemTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dòng xe / Model *</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="VD: S500, X7, Civic"
              placeholderTextColor={LuxeColors.onSurfaceVariant}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Màu sắc *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowColorPicker(!showColorPicker)}
            >
              <Text style={[styles.pickerText, !color && styles.pickerPlaceholder]}>
                {color || 'Chọn màu xe'}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {showColorPicker && (
              <View style={styles.pickerList}>
                {CAR_COLORS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.pickerItem, color === item.value && styles.pickerItemSelected]}
                    onPress={() => {
                      setColor(item.value);
                      setShowColorPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, color === item.value && styles.pickerItemTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            Bằng cách thêm xe, bạn đồng ý rằng biển số xe là chính chủ và thuộc quyền sở hữu của bạn.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Đang xử lý...' : 'Thêm xe'}
          </Text>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  form: {
    gap: LuxeSpacing.lg,
  },
  inputGroup: {
    gap: LuxeSpacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    fontSize: 16,
    color: LuxeColors.onSurface,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  hint: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  pickerText: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  pickerPlaceholder: {
    color: LuxeColors.onSurfaceVariant,
  },
  pickerArrow: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  pickerList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: LuxeBorderRadius.md,
    marginTop: LuxeSpacing.xs,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '30',
  },
  pickerItemSelected: {
    backgroundColor: LuxeColors.primaryContainer + '20',
  },
  pickerItemText: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  pickerItemTextSelected: {
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  note: {
    flexDirection: 'row',
    backgroundColor: LuxeColors.primaryContainer + '10',
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    marginTop: LuxeSpacing.lg,
    gap: LuxeSpacing.sm,
  },
  noteIcon: {
    fontSize: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '30',
  },
  submitBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.md,
    paddingVertical: LuxeSpacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

/**
 * Add Vehicle Screen
 * POST /api/v1/vehicles
 * CreateVehicleDTO: { licensePlate, vehicleTypeId, registrationPhotoUrl?, userNote? }
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService, VehicleType } from '@/services/api/vehicleService';
import { uploadImage } from '@/services/api/uploadService';

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  Sedan: '🚗',
  SUV: '🚙',
  Pickup: '🛻',
  Van: '🚐',
  Motorcycle: '🏍️',
  Khác: '🚘',
  Other: '🚘',
};

export default function AddVehicleScreen() {
  const router = useRouter();
  const { addVehicle } = useAuth();

  const OTHER_TYPE_ID = -1;

  const [licensePlate, setLicensePlate] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [otherVehicleType, setOtherVehicleType] = useState('');
  const [registrationPhoto, setRegistrationPhoto] = useState<string | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedType = vehicleTypes.find(t => t.id === selectedTypeId);
  const isOtherType = selectedType?.name.toLowerCase().includes('khác') || selectedType?.name.toLowerCase().includes('other');

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await vehicleService.getVehicleTypes();
        if (res.statusCode === 200 && res.data) {
          const types = [...res.data, { id: OTHER_TYPE_ID, name: 'Khác' }];
          setVehicleTypes(types);
          if (types.length > 0) {
            setSelectedTypeId(types[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load vehicle types:', e);
        const fallback: VehicleType[] = [
          { id: 1, name: 'Sedan' },
          { id: 2, name: 'SUV' },
          { id: 3, name: 'Pickup' },
          { id: OTHER_TYPE_ID, name: 'Khác' },
        ];
        setVehicleTypes(fallback);
        setSelectedTypeId(1);
      } finally {
        setLoadingTypes(false);
      }
    };
    loadTypes();
  }, []);

  const normalizePlate = (text: string): string => {
    const cleaned = text.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 8);
    const hasLetterAfterProvince = /^[0-9]{2}[A-Z]/.test(cleaned);
    const len = cleaned.length;

    if (len <= 2) return cleaned;

    // Plain numeric plates (no letter after province code)
    if (!hasLetterAfterProvince) {
      if (len === 3) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 6) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}.${cleaned.slice(4)}`;
      if (len === 7) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}.${cleaned.slice(6)}`;
    }

    // Plates with letter after province code (e.g., 51H, 50A)
    const province = cleaned.slice(0, 2);
    const letter = cleaned.slice(2, 3);
    const afterLetter = cleaned.slice(3);
    const afterLen = afterLetter.length;

    if (afterLen === 3) return `${province}${letter}-${afterLetter}`;
    if (afterLen === 4) return `${province}${letter}-${afterLetter.slice(0, 3)}.${afterLetter.slice(3)}`;
    if (afterLen === 5) return `${province}${letter}-${afterLetter.slice(0, 3)}.${afterLetter.slice(3, 5)}`;
    return `${province}${letter}-${afterLetter}`;
  };

  const isValidPlate = (plate: string): boolean => {
    return /^[0-9]{2}[A-Z0-9]-[0-9]{3,5}(\.[0-9]{2})?$/.test(plate);
  };

  const handlePlateChange = (text: string) => {
    const prevPlate = licensePlate;

    if (text.length < prevPlate.length) {
      const cleaned = text.replace(/[^0-9A-Z]/g, '').slice(0, 8);
      if (cleaned.length <= 2) {
        setLicensePlate(cleaned);
      } else {
        setLicensePlate(text);
      }
      return;
    }

    setLicensePlate(normalizePlate(text));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Vui lòng cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setRegistrationPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập biển số xe');
      return;
    }
    if (!isValidPlate(licensePlate)) {
      Alert.alert('Lỗi', 'Biển số xe không hợp lệ. Định dạng: 51H-123.45');
      return;
    }
    if (!selectedTypeId) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại xe');
      return;
    }
    if (!registrationPhoto) {
      Alert.alert('Lỗi', 'Vui lòng thêm ảnh thực tế của xe');
      return;
    }
    if (isOtherType && !otherVehicleType.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập loại xe khi chọn "Khác"');
      return;
    }

    setIsSubmitting(true);

    try {
      const note = isOtherType ? otherVehicleType.trim() : undefined;
      let photoUrl: string | undefined;

      if (registrationPhoto) {
        const uploadResult = await uploadImage(registrationPhoto);
        if (!uploadResult.success) {
          Alert.alert('Lỗi', uploadResult.error || 'Không thể tải ảnh lên. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }
        photoUrl = uploadResult.url;
      }
      const result = await addVehicle(licensePlate, selectedTypeId, photoUrl, note);
      if (result.success) {
        Alert.alert('Thành công', 'Xe đã được thêm vào tài khoản', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể thêm xe. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
              maxLength={12}
              autoCapitalize="characters"
            />
            <Text style={styles.hint}>Định dạng: 51H-123 hoặc 51H-123.45</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại xe *</Text>
            {loadingTypes ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={LuxeColors.primaryContainer} />
                <Text style={styles.loadingText}>Đang tải loại xe...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowTypePicker(!showTypePicker)}
                >
                  <View style={styles.pickerLeft}>
                    <Text style={styles.pickerIcon}>
                      {VEHICLE_TYPE_ICONS[selectedType?.name || ''] || '🚗'}
                    </Text>
                    <Text style={[styles.pickerText, !selectedType && styles.pickerPlaceholder]}>
                      {selectedType?.name || 'Chọn loại xe'}
                    </Text>
                  </View>
                  <Text style={styles.pickerArrow}>{showTypePicker ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showTypePicker && (
                  <View style={styles.pickerList}>
                    {vehicleTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.pickerItem,
                          selectedTypeId === type.id && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedTypeId(type.id);
                          setShowTypePicker(false);
                        }}
                      >
                        <Text style={styles.pickerItemIcon}>
                          {VEHICLE_TYPE_ICONS[type.name] || '🚗'}
                        </Text>
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedTypeId === type.id && styles.pickerItemTextSelected,
                          ]}
                        >
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
          </View>

          {isOtherType && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại xe cụ thể *</Text>
              <TextInput
                style={styles.input}
                value={otherVehicleType}
                onChangeText={setOtherVehicleType}
                placeholder="VD: Truck, Convertible, Limousine"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                maxLength={50}
              />
              <Text style={styles.hint}>Nhập loại xe để chúng tôi hỗ trợ cập nhật</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh thực tế xe *</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
              {registrationPhoto ? (
                <Image source={{ uri: registrationPhoto }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Text style={styles.imagePickerIcon}>📷</Text>
                  <Text style={styles.imagePickerText}>Thêm ảnh xe</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.hint}>Chụp hoặc chọn ảnh biển số xe để xác minh</Text>
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
          style={[
            styles.submitBtn,
            (isSubmitting || loadingTypes || !licensePlate.trim() || !selectedTypeId || !registrationPhoto || (isOtherType && !otherVehicleType.trim())) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || loadingTypes || !licensePlate.trim() || !selectedTypeId || !registrationPhoto || (isOtherType && !otherVehicleType.trim())}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? (registrationPhoto ? 'Đang tải ảnh...' : 'Đang xử lý...') : 'Thêm xe'}
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
    paddingBottom: 120,
  },
  form: {
    gap: LuxeSpacing.xl,
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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: LuxeColors.primaryContainer,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: LuxeSpacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
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
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.sm,
  },
  pickerIcon: {
    fontSize: 24,
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
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.sm,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '30',
  },
  pickerItemSelected: {
    backgroundColor: LuxeColors.primaryContainer + '20',
  },
  pickerItemIcon: {
    fontSize: 24,
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
    marginTop: LuxeSpacing.xl,
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
  imagePickerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 120,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LuxeSpacing.xl,
  },
  imagePickerIcon: {
    fontSize: 32,
    marginBottom: LuxeSpacing.xs,
  },
  imagePickerText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

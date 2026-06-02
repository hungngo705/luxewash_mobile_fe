/**
 * Add Vehicle Screen
 * POST /api/v1/vehicles
 * CreateVehicleDTO: { licensePlate, vehicleTypeId, registrationPhotoUrl?, userNote? }
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { vehicleService, VehicleType } from '@/services/api/vehicleService';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredTokens, BASE_URL } from '@/services/api/client';

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  Sedan: 'truck',
  SUV: 'truck',
  Pickup: 'truck',
  Van: 'truck',
  Motorcycle: 'activity',
  Khác: 'truck',
  Other: 'truck',
};

export default function AddVehicleScreen() {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const { refreshProfile } = useAuth();

  const OTHER_TYPE_ID = -1;

  const [licensePlate, setLicensePlate] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [otherVehicleType, setOtherVehicleType] = useState('');
  const [registrationPhoto, setRegistrationPhoto] = useState<string | null>(null);
  const webFileRef = useRef<globalThis.File | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!hasLetterAfterProvince) {
      // Plain numeric: 11-123 or 11-123.45
      if (len === 3) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      // Backend regex: ^[0-9]{2}[A-Z0-9]-[0-9]{3,5}(\.[0-9]{2})?$
      // Max 5 digits after hyphen; decimal part must be exactly 2 digits
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}.${cleaned.slice(5, 7)}`;
    }

    const province = cleaned.slice(0, 2);
    const letter = cleaned.slice(2, 3);
    const afterLetter = cleaned.slice(3, 3 + 5); // cap at 5 chars to satisfy backend regex
    const afterLen = afterLetter.length;

    if (afterLen <= 3) return `${province}${letter}-${afterLetter}`;
    if (afterLen === 4) return `${province}${letter}-${afterLetter.slice(0, 3)}.${afterLetter.slice(3)}`;
    // afterLen === 5: format as XXXXX.XX, strip excess
    return `${province}${letter}-${afterLetter.slice(0, 3)}.${afterLetter.slice(3, 5)}`;
  };

  const handlePlateChange = (text: string) => {
    setLicensePlate(normalizePlate(text));
  };

  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Vui lòng cấp quyền truy cập thư viện ảnh');
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

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      webFileRef.current = file;
      setRegistrationPhoto(URL.createObjectURL(file));
    }
  };

  const getFileObject = (): File | Blob => {
    if (Platform.OS === 'web' && webFileRef.current) {
      return webFileRef.current;
    }
    if (registrationPhoto) {
      return new File(registrationPhoto);
    }
    throw new Error('No image selected');
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      alert('Vui lòng nhập biển số xe');
      return;
    }
    if (!selectedTypeId) {
      alert('Vui lòng chọn loại xe');
      return;
    }
    if (!registrationPhoto) {
      alert('Vui lòng thêm ảnh thực tế của xe');
      return;
    }
    if (isOtherType && !otherVehicleType.trim()) {
      alert('Vui lòng nhập loại xe khi chọn "Khác"');
      return;
    }

    setIsSubmitting(true);

    try {
      const note = isOtherType ? otherVehicleType.trim() : undefined;

      const formData = new FormData();
      formData.append('licensePlate', licensePlate);
      formData.append('vehicleTypeId', String(selectedTypeId));
      if (note) {
        formData.append('userNote', note);
      }

      const file = getFileObject();
      formData.append('PhotoFile', file as unknown as Blob);

      const { accessToken } = await getStoredTokens();
      const response = await expoFetch(`${BASE_URL}/vehicles`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
      });

      if (response.ok) {
        confirm({
          title: 'Thành công',
          message: 'Xe đã được thêm vào tài khoản',
          confirmText: 'Xác nhận',
          showCancel: false,
          onConfirm: async () => {
          await refreshProfile();
          router.replace('/vehicles');
        },
        });
      } else {
        const errorData = response.json ? await response.json().catch(() => null) : null;
        const errorMessage =
          errorData?.message || `Lỗi ${response.status}: Không thể thêm xe.`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Add vehicle error:', error);
      const message =
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi thêm xe. Vui lòng thử lại.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={LuxeColors.onSurface} />
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
            <Text style={styles.hint}>Định dạng: 51H-123.45</Text>
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
                    <Feather name={VEHICLE_TYPE_ICONS[selectedType?.name || ''] as any || 'truck'} size={18} color={LuxeColors.primaryContainer} />
                    <Text style={[styles.pickerText, !selectedType && styles.pickerPlaceholder]}>
                      {selectedType?.name || 'Chọn loại xe'}
                    </Text>
                  </View>
                  <Feather name={showTypePicker ? 'chevron-up' : 'chevron-down'} size={18} color={LuxeColors.onSurfaceVariant} />
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
                        <Feather name={VEHICLE_TYPE_ICONS[type.name] as any || 'truck'} size={16} color={LuxeColors.primaryContainer} />
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
                  <View style={styles.imagePickerIconWrap}>
                    <Feather name="camera" size={28} color={LuxeColors.primaryContainer} />
                  </View>
                  <Text style={styles.imagePickerText}>Thêm ảnh xe</Text>
                </View>
              )}
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <input
                ref={fileInputRef as any}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleWebFileChange as any}
              />
            )}
            <Text style={styles.hint}>Chụp hoặc chọn ảnh biển số xe để xác minh</Text>
          </View>

          <View style={styles.note}>
            <Feather name="info" size={16} color={LuxeColors.primaryContainer} />
            <Text style={styles.noteText}>
              Bằng cách thêm xe, bạn đồng ý rằng biển số xe là chính chủ và thuộc quyền sở hữu của bạn.
            </Text>
          </View>
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
    borderBottomColor: '#bec8cf50',
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
  pickerText: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  pickerPlaceholder: {
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
    borderBottomColor: '#bec8cf50',
  },
  pickerItemSelected: {
    backgroundColor: '#4aa9d733',
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
    backgroundColor: '#4aa9d71a',
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    marginTop: LuxeSpacing.xl,
    gap: LuxeSpacing.sm,
    alignItems: 'flex-start',
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
  imagePickerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4aa9d733',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopColor: '#bec8cf50',
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

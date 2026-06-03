/**
 * Add Vehicle Screen
 * POST /api/v1/vehicles
 * CreateVehicleDTO: { licensePlate, vehicleTypeId, carModelId?, carModel? (for "Khác"), registrationPhotoUrl?, PhotoFile?, userNote? }
 */

import { useConfirmDialog } from "@/components/ConfirmDialog";
import {
  LuxeBorderRadius,
  LuxeColors,
  LuxeSpacing,
} from "@/constants/luxeTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BASE_URL, getStoredTokens } from "@/services/api/client";
import {
  CarModel,
  vehicleService,
  VehicleType,
} from "@/services/api/vehicleService";
import { Feather } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  Sedan: "truck",
  SUV: "truck",
  Pickup: "truck",
  Van: "truck",
  Motorcycle: "activity",
  Khác: "truck",
  Other: "truck",
};

export default function AddVehicleScreen() {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const { refreshProfile } = useAuth();

  const [licensePlate, setLicensePlate] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [registrationPhoto, setRegistrationPhoto] = useState<string | null>(
    null,
  );
  const webFileRef = useRef<globalThis.File | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Car model dropdown state
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [selectedCarModel, setSelectedCarModel] = useState<CarModel | null>(
    null,
  );
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  // Free-text car model when user selects "Khác" in dòng xe dropdown
  const [otherCarModelText, setOtherCarModelText] = useState("");
  const [isOtherModelFreeText, setIsOtherModelFreeText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedType = vehicleTypes.find((t) => t.id === selectedTypeId);

  // Group car models by brand, deduplicate by id
  const groupedModels = useMemo(() => {
    const seen = new Set<number>();
    const filtered = carModels.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return (
        m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        m.brand.toLowerCase().includes(modelSearchQuery.toLowerCase())
      );
    });
    const groups: Record<string, CarModel[]> = {};
    for (const model of filtered) {
      if (!groups[model.brand]) groups[model.brand] = [];
      groups[model.brand].push(model);
    }
    return groups;
  }, [carModels, modelSearchQuery]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await vehicleService.getVehicleTypes();
        if (res.statusCode === 200 && res.data) {
          setVehicleTypes(res.data);
          if (res.data.length > 0) {
            setSelectedTypeId(res.data[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load vehicle types:", e);
        const fallback: VehicleType[] = [
          { id: 1, name: "Sedan" },
          { id: 2, name: "SUV" },
          { id: 3, name: "Pickup" },
        ];
        setVehicleTypes(fallback);
        setSelectedTypeId(1);
      } finally {
        setLoadingTypes(false);
      }
    };
    loadTypes();
  }, []);

  // Reset car model selection when vehicle type changes
  useEffect(() => {
    setShowModelPicker(false);
    setSelectedCarModel(null);
    setModelSearchQuery("");
    setOtherCarModelText("");
    setIsOtherModelFreeText(false);
  }, [selectedTypeId]);

  // Reset free-text car model when dropdown selection changes
  useEffect(() => {
    if (selectedCarModel) {
      setOtherCarModelText("");
      setIsOtherModelFreeText(false);
    }
  }, [selectedCarModel]);

  useEffect(() => {
    const loadCarModels = async () => {
      try {
        const res = await vehicleService.getCarModels();
        if (res.statusCode === 200 && res.data) {
          setCarModels(res.data);
        }
      } catch (e) {
        console.error("Failed to load car models:", e);
      } finally {
        setLoadingModels(false);
      }
    };
    loadCarModels();
  }, []);

  const normalizePlate = (text: string): string => {
    const cleaned = text
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "")
      .slice(0, 8);
    const hasLetterAfterProvince = /^[0-9]{2}[A-Z]/.test(cleaned);
    const len = cleaned.length;

    if (len <= 2) return cleaned;

    if (!hasLetterAfterProvince) {
      if (len === 3) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (len === 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}.${cleaned.slice(5, 7)}`;
    }

    const province = cleaned.slice(0, 2);
    const letter = cleaned.slice(2, 3);
    const afterLetter = cleaned.slice(3, 3 + 5);
    const afterLen = afterLetter.length;

    if (afterLen <= 3) return `${province}${letter}-${afterLetter}`;
    if (afterLen === 4)
      return `${province}${letter}-${afterLetter.slice(0, 3)}.${afterLetter.slice(3)}`;
    return `${province}${letter}-${afterLetter.slice(0, 3)}.${afterLetter.slice(3, 5)}`;
  };

  const handlePlateChange = (text: string) => {
    setLicensePlate(normalizePlate(text));
  };

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Vui lòng cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
    if (Platform.OS === "web" && webFileRef.current) {
      return webFileRef.current;
    }
    if (registrationPhoto) {
      return new File(registrationPhoto);
    }
    throw new Error("No image selected");
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      alert("Vui lòng nhập biển số xe");
      return;
    }
    if (!isOtherModelFreeText && !selectedCarModel) {
      alert("Vui lòng chọn dòng xe");
      return;
    }
    if (!selectedTypeId) {
      alert("Vui lòng chọn loại xe");
      return;
    }
    if (!registrationPhoto) {
      alert("Vui lòng thêm ảnh thực tế của xe");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("licensePlate", licensePlate);
      formData.append("vehicleTypeId", String(selectedTypeId!));

      if (isOtherModelFreeText) {
        formData.append("carModel", otherCarModelText.trim());
      } else if (selectedCarModel) {
        formData.append("carModelId", String(selectedCarModel.id));
      }

      const file = getFileObject();
      formData.append("PhotoFile", file as unknown as Blob);

      const { accessToken } = await getStoredTokens();
      const response = await expoFetch(`${BASE_URL}/vehicles`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
      });

      if (response.ok) {
        confirm({
          title: "Thành công",
          message: "Xe đã được thêm vào tài khoản",
          confirmText: "Xác nhận",
          showCancel: false,
          onConfirm: async () => {
            await refreshProfile();
            router.replace("/vehicles");
          },
        });
      } else {
        const errorData = response.json
          ? await response.json().catch(() => null)
          : null;
        const errorMessage =
          errorData?.message || `Lỗi ${response.status}: Không thể thêm xe.`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Add vehicle error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi thêm xe. Vui lòng thử lại.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    loadingTypes ||
    !licensePlate.trim() ||
    (!selectedCarModel && !isOtherModelFreeText) ||
    !selectedTypeId ||
    !registrationPhoto;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={LuxeColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm xe mới</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
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

          {/* Car Model Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dòng xe *</Text>
            {loadingModels ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator
                  size="small"
                  color={LuxeColors.primaryContainer}
                />
                <Text style={styles.loadingText}>Đang tải dòng xe...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowModelPicker(!showModelPicker)}
                >
                  <View style={styles.pickerLeft}>
                    <Feather
                      name="truck"
                      size={18}
                      color={LuxeColors.primaryContainer}
                    />
                    <Text
                      style={[
                        styles.pickerText,
                        !isOtherModelFreeText &&
                          !selectedCarModel &&
                          styles.pickerPlaceholder,
                      ]}
                    >
                      {isOtherModelFreeText
                        ? "Khác"
                        : selectedCarModel
                          ? `${selectedCarModel.brand} ${selectedCarModel.name}`
                          : "Chọn dòng xe"}
                    </Text>
                  </View>
                  <Feather
                    name={showModelPicker ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={LuxeColors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {showModelPicker && (
                  <View style={styles.modelPickerContainer}>
                    <View style={styles.modelSearchContainer}>
                      <Feather
                        name="search"
                        size={16}
                        color={LuxeColors.onSurfaceVariant}
                      />
                      <TextInput
                        style={styles.modelSearchInput}
                        value={modelSearchQuery}
                        onChangeText={setModelSearchQuery}
                        placeholder="Tìm dòng xe..."
                        placeholderTextColor={LuxeColors.onSurfaceVariant}
                        autoCapitalize="words"
                      />
                      {modelSearchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setModelSearchQuery("")}
                        >
                          <Feather
                            name="x"
                            size={16}
                            color={LuxeColors.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <FlatList
                      data={Object.entries(groupedModels)}
                      keyExtractor={([brand]) => brand}
                      style={styles.modelList}
                      nestedScrollEnabled
                      renderItem={({ item: [brand, models] }) => (
                        <View>
                          <Text style={styles.modelBrandHeader}>{brand}</Text>
                          {models.map((model) => (
                            <TouchableOpacity
                              key={model.id}
                              style={[
                                styles.modelItem,
                                selectedCarModel?.id === model.id &&
                                  styles.modelItemSelected,
                              ]}
                              onPress={() => {
                                setSelectedCarModel(model);
                                setShowModelPicker(false);
                                setModelSearchQuery("");
                              }}
                            >
                              <Text
                                style={[
                                  styles.modelItemText,
                                  selectedCarModel?.id === model.id &&
                                    styles.modelItemTextSelected,
                                ]}
                              >
                                {model.name}
                              </Text>
                              {selectedCarModel?.id === model.id && (
                                <Feather
                                  name="check"
                                  size={16}
                                  color={LuxeColors.primaryContainer}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.modelEmptyText}>
                          Không tìm thấy dòng xe
                        </Text>
                      }
                      ListFooterComponent={
                        <View>
                          <View style={styles.khacDivider}>
                            <View style={styles.khacDividerLine} />
                            <Text style={styles.khacDividerText}>Khác</Text>
                            <View style={styles.khacDividerLine} />
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.modelItem,
                              isOtherModelFreeText &&
                                !selectedCarModel &&
                                styles.modelItemSelected,
                            ]}
                            onPress={() => {
                              setSelectedCarModel(null);
                              setOtherCarModelText("");
                              setIsOtherModelFreeText(true);
                              setShowModelPicker(false);
                              setModelSearchQuery("");
                            }}
                          >
                            <Text
                              style={[
                                styles.modelItemText,
                                isOtherModelFreeText &&
                                  !selectedCarModel &&
                                  styles.modelItemTextSelected,
                              ]}
                            >
                              Khác
                            </Text>
                            {isOtherModelFreeText && !selectedCarModel && (
                              <Feather
                                name="check"
                                size={16}
                                color={LuxeColors.primaryContainer}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      }
                    />
                  </View>
                )}
                {isOtherModelFreeText && (
                  <TextInput
                    style={styles.inputModel}
                    value={otherCarModelText}
                    onChangeText={setOtherCarModelText}
                    placeholder="VD: Toyota Camry, Mazda 3, Ford Everest"
                    placeholderTextColor={LuxeColors.onSurfaceVariant}
                    maxLength={100}
                    autoCapitalize="words"
                  />
                )}
              </>
            )}
            {!loadingModels && !isOtherModelFreeText && (
              <Text style={styles.hint}>
                Chọn dòng xe từ danh sách. Nếu không có, chọn "Khác" và nhập
                dòng xe.
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại xe *</Text>
            {loadingTypes ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator
                  size="small"
                  color={LuxeColors.primaryContainer}
                />
                <Text style={styles.loadingText}>Đang tải loại xe...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowTypePicker(!showTypePicker)}
                >
                  <View style={styles.pickerLeft}>
                    <Feather
                      name={
                        (VEHICLE_TYPE_ICONS[selectedType?.name || ""] as any) ||
                        "truck"
                      }
                      size={18}
                      color={LuxeColors.primaryContainer}
                    />
                    <Text
                      style={[
                        styles.pickerText,
                        !selectedType && styles.pickerPlaceholder,
                      ]}
                    >
                      {selectedType?.name || "Chọn loại xe"}
                    </Text>
                  </View>
                  <Feather
                    name={showTypePicker ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={LuxeColors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {showTypePicker && (
                  <View style={styles.pickerList}>
                    {vehicleTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.pickerItem,
                          selectedTypeId === type.id &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedTypeId(type.id);
                          setShowTypePicker(false);
                        }}
                      >
                        <Feather
                          name={
                            (VEHICLE_TYPE_ICONS[type.name] as any) || "truck"
                          }
                          size={16}
                          color={LuxeColors.primaryContainer}
                        />
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedTypeId === type.id &&
                              styles.pickerItemTextSelected,
                          ]}
                        >
                          {type.name}
                        </Text>
                        {selectedTypeId === type.id && (
                          <Feather
                            name="check"
                            size={16}
                            color={LuxeColors.primaryContainer}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh thực tế xe *</Text>
            <TouchableOpacity
              style={styles.imagePickerBtn}
              onPress={handlePickImage}
            >
              {registrationPhoto ? (
                <Image
                  source={{ uri: registrationPhoto }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <View style={styles.imagePickerIconWrap}>
                    <Feather
                      name="camera"
                      size={28}
                      color={LuxeColors.primaryContainer}
                    />
                  </View>
                  <Text style={styles.imagePickerText}>Thêm ảnh xe</Text>
                </View>
              )}
            </TouchableOpacity>
            {Platform.OS === "web" && (
              <input
                ref={fileInputRef as any}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleWebFileChange as any}
              />
            )}
            <Text style={styles.hint}>
              Chụp hoặc chọn ảnh biển số xe để xác minh
            </Text>
          </View>

          <View style={styles.note}>
            <Feather
              name="info"
              size={16}
              color={LuxeColors.primaryContainer}
            />
            <Text style={styles.noteText}>
              Bằng cách thêm xe, bạn đồng ý rằng biển số xe là chính chủ và
              thuộc quyền sở hữu của bạn.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            isSubmitDisabled && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? "Đang xử lý..." : "Thêm xe"}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#bec8cf50",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "600",
    color: LuxeColors.onSurface,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    color: LuxeColors.primaryContainer,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    textAlign: "center",
  },
  inputModel: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: LuxeSpacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: LuxeBorderRadius.md,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  pickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: LuxeSpacing.sm,
  },
  pickerText: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  pickerPlaceholder: {
    color: LuxeColors.onSurfaceVariant,
  },
  modelPickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: LuxeBorderRadius.md,
    marginTop: LuxeSpacing.xs,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    maxHeight: 320,
    overflow: "hidden",
  },
  modelSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#bec8cf50",
    gap: LuxeSpacing.sm,
  },
  modelSearchInput: {
    flex: 1,
    fontSize: 15,
    color: LuxeColors.onSurface,
    padding: 0,
  },
  modelList: {
    maxHeight: 260,
  },
  modelBrandHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: LuxeColors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: LuxeSpacing.md,
    paddingTop: LuxeSpacing.sm,
    paddingBottom: 4,
    backgroundColor: LuxeColors.surfaceContainerHighest + "40",
  },
  modelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#bec8cf30",
  },
  modelItemSelected: {
    backgroundColor: "#4aa9d733",
  },
  modelItemText: {
    fontSize: 15,
    color: LuxeColors.onSurface,
  },
  modelItemTextSelected: {
    color: LuxeColors.primaryContainer,
    fontWeight: "600",
  },
  khacDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: LuxeSpacing.md,
    paddingTop: LuxeSpacing.sm,
    paddingBottom: 2,
    gap: 6,
  },
  khacDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: LuxeColors.outlineVariant,
  },
  khacDividerText: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dongXeInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4aa9d71a",
    borderRadius: LuxeBorderRadius.sm,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    marginTop: LuxeSpacing.xs,
  },
  dongXeInfoText: {
    fontSize: 13,
    color: LuxeColors.primaryContainer,
    fontWeight: "500",
  },
  modelEmptyText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: "center",
    padding: LuxeSpacing.lg,
  },
  pickerList: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: LuxeBorderRadius.md,
    marginTop: LuxeSpacing.xs,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    overflow: "hidden",
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: LuxeSpacing.sm,
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#bec8cf50",
  },
  pickerItemSelected: {
    backgroundColor: "#4aa9d733",
  },
  pickerItemText: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  pickerItemTextSelected: {
    color: LuxeColors.primaryContainer,
    fontWeight: "600",
  },
  note: {
    flexDirection: "row",
    backgroundColor: "#4aa9d71a",
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    marginTop: LuxeSpacing.xl,
    gap: LuxeSpacing.sm,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
  },
  imagePickerBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: LuxeBorderRadius.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
    borderStyle: "dashed",
    overflow: "hidden",
    minHeight: 120,
  },
  imagePickerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: LuxeSpacing.xl,
  },
  imagePickerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4aa9d733",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: LuxeSpacing.xs,
  },
  imagePickerText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "#bec8cf50",
  },
  submitBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.md,
    paddingVertical: LuxeSpacing.md,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
});

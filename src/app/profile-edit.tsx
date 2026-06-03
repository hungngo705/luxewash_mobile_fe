/**
 * Profile Edit Screen
 * Bold professional redesign with solid white form card
 */

import {
    LuxeBorderRadius,
    LuxeColors,
    LuxeSpacing,
    LuxeShadows,
} from "@/constants/luxeTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, authService } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Header } from "@/components/ui/Header";

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  api?: string;
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setPhoneNumber(user.phoneNumber || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!PHONE_REGEX.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (VD: 0912345678)";
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Email không đúng định dạng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await authService.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
      });

      if (response.statusCode === 200) {
        await refreshProfile?.();
        router.back();
      } else {
        setErrors({ api: response.message || "Cập nhật thất bại." });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ api: (err as ApiError).message });
      } else {
        setErrors({ api: "Đã xảy ra lỗi. Vui lòng thử lại." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges =
    fullName.trim() !== (user?.name || "") ||
    phoneNumber.trim() !== (user?.phoneNumber || "") ||
    email.trim() !== (user?.email || "");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Chỉnh sửa hồ sơ" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errors.api && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color="#dc2626" />
              <Text style={styles.errorBannerText}>{errors.api}</Text>
            </View>
          )}

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {fullName.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.avatarHint}>Ảnh đại diện</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Họ và tên</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                placeholderTextColor={LuxeColors.outline}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={100}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="VD: 0912345678"
                placeholderTextColor={LuxeColors.outline}
                keyboardType="phone-pad"
                autoCorrect={false}
                maxLength={15}
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="VD: user@example.com"
                placeholderTextColor={LuxeColors.outline}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={100}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.saveBtn, (!hasChanges || submitting) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!hasChanges || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorBannerText: { fontSize: 13, color: "#DC2626", fontWeight: "500", flex: 1 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...LuxeShadows.lg,
  },
  avatarText: { fontSize: 40, fontWeight: "700", color: "#ffffff" },
  avatarHint: { fontSize: 13, color: LuxeColors.onSurfaceVariant },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...LuxeShadows.lg,
  },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13, fontWeight: "700",
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: LuxeColors.background,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: LuxeColors.onSurface,
    borderWidth: 1.5,
    borderColor: LuxeColors.outlineVariant,
  },
  inputError: { borderColor: "#DC2626" },
  errorText: { fontSize: 12, color: "#DC2626", marginTop: 6, fontWeight: "500" },
  buttons: { gap: 12 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: 14,
    paddingVertical: 16,
    ...LuxeShadows.primary,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: LuxeColors.outlineVariant,
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600", color: LuxeColors.onSurfaceVariant },
});

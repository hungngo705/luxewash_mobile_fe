/**
 * Profile Edit Screen
 * Allows user to update their name, phone, and email
 */

import {
    LuxeBorderRadius,
    LuxeColors,
    LuxeSpacing,
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
        setErrors({ api: err.message });
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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* API Error Banner */}
          {errors.api && (
            <View style={styles.errorBanner}>
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

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={100}
              />
              {errors.fullName && (
                <Text style={styles.fieldError}>{errors.fullName}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.field}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="VD: 0912345678"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                keyboardType="phone-pad"
                autoCorrect={false}
                maxLength={15}
              />
              {errors.phoneNumber && (
                <Text style={styles.fieldError}>{errors.phoneNumber}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="VD: user@example.com"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={100}
              />
              {errors.email && (
                <Text style={styles.fieldError}>{errors.email}</Text>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!hasChanges || submitting) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + "20",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: LuxeColors.onSurface,
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
    paddingBottom: 100,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.lg,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorBannerText: {
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: LuxeSpacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: LuxeSpacing.sm,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#ffffff",
  },
  avatarHint: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.lg,
  },
  field: {
    marginBottom: LuxeSpacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: LuxeColors.onSurfaceVariant,
    marginBottom: LuxeSpacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: LuxeColors.background,
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    fontSize: 16,
    color: LuxeColors.onSurface,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + "40",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  fieldError: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: "center",
    marginBottom: LuxeSpacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  cancelBtn: {
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + "40",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: LuxeColors.onSurfaceVariant,
  },
});

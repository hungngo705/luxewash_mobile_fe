/**
 * Change Password Screen - LuxeWash
 * Authenticated users can change their password
 */

import { useConfirmDialog } from "@/components/ConfirmDialog";
import {
    LuxeBorderRadius,
    LuxeColors,
    LuxeSpacing,
} from "@/constants/luxeTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

const PASSWORD_MIN_LENGTH = 8;

interface FieldErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  apiError?: string;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const { confirm } = useConfirmDialog();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  };

  const validateAndSubmit = async () => {
    const errors: FieldErrors = {};

    if (!oldPassword.trim()) {
      errors.oldPassword = "Vui lòng nhập mật khẩu cũ";
    }

    if (!newPassword.trim()) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
      errors.newPassword = `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`;
    } else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(newPassword)) {
        errors.newPassword = "Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số";
      }
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      errors.newPassword = "Mật khẩu mới không được trùng với mật khẩu cũ";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const result = await changePassword(oldPassword, newPassword);

    setIsSubmitting(false);

    if (result.success) {
      confirm({
        title: "Thành công",
        message: "Mật khẩu đã được thay đổi.",
        confirmText: "Xác nhận",
        showCancel: false,
        onConfirm: () => router.back(),
      });
    } else {
      setFieldErrors({
        apiError: result.error || "Đổi mật khẩu thất bại. Vui lòng thử lại.",
      });
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    isSecure = true,
    showPasswordToggle?: boolean,
    togglePasswordVisible?: () => void,
    isPasswordVisible?: boolean,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.passwordInput, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor={LuxeColors.onSurfaceVariant}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            clearFieldError(label as keyof FieldErrors);
          }}
          secureTextEntry={isSecure && !isPasswordVisible}
          autoCapitalize="none"
          autoComplete="password-new"
        />
        {showPasswordToggle && togglePasswordVisible && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={togglePasswordVisible}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={LuxeColors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Feather
              name="lock"
              size={40}
              color={LuxeColors.primaryContainer}
            />
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Nhập mật khẩu cũ và mật khẩu mới để thay đổi
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* API Error Banner */}
            {fieldErrors.apiError && (
              <View style={styles.apiErrorBanner}>
                <Text style={styles.apiErrorText}>{fieldErrors.apiError}</Text>
              </View>
            )}

            {renderInput(
              "Mật khẩu cũ",
              oldPassword,
              setOldPassword,
              "Nhập mật khẩu cũ",
              fieldErrors.oldPassword,
              true,
              true,
              () => setShowOldPassword((prev) => !prev),
              showOldPassword,
            )}

            {renderInput(
              "Mật khẩu mới",
              newPassword,
              setNewPassword,
              `Nhập mật khẩu mới`,
              fieldErrors.newPassword,
              true,
              true,
              () => setShowNewPassword((prev) => !prev),
              showNewPassword,
            )}

            {renderInput(
              "Xác nhận mật khẩu mới",
              confirmPassword,
              setConfirmPassword,
              "Nhập lại mật khẩu mới",
              fieldErrors.confirmPassword,
              true,
              true,
              () => setShowConfirmPassword((prev) => !prev),
              showConfirmPassword,
            )}

            {/* Password Rules Hint */}
            <View style={styles.rulesHint}>
              <Text style={styles.rulesTitle}>Yêu cầu mật khẩu:</Text>
              <Text style={styles.rulesText}>- Ít nhất 8 ký tự</Text>
              <Text style={styles.rulesText}>
                - Chứa ít nhất 1 chữ hoa (A-Z)
              </Text>
              <Text style={styles.rulesText}>
                - Chứa ít nhất 1 chữ số (0-9)
              </Text>
              <Text style={styles.rulesText}>- Khác mật khẩu cũ</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={validateAndSubmit}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    padding: LuxeSpacing.lg,
    paddingTop: LuxeSpacing.xl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: LuxeSpacing.md,
  },
  description: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: LuxeSpacing.lg,
    lineHeight: 20,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.lg,
  },
  inputContainer: {
    marginBottom: LuxeSpacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 6,
  },
  input: {
    backgroundColor: LuxeColors.surfaceContainer,
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    fontSize: 16,
    color: LuxeColors.onSurface,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + "30",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LuxeColors.surfaceContainer,
    borderRadius: LuxeBorderRadius.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + "30",
  },
  passwordInput: {
    flex: 1,
    padding: LuxeSpacing.md,
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  eyeBtn: {
    padding: LuxeSpacing.md,
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    fontWeight: "500",
  },
  apiErrorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  apiErrorText: {
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "500",
  },
  rulesHint: {
    backgroundColor: LuxeColors.surfaceVariant + "30",
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.md,
    marginTop: LuxeSpacing.sm,
  },
  rulesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 4,
  },
  rulesText: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: "center",
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

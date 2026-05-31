/**
 * Register Screen - LuxeWash
 * Account registration with phone, email, name and password
 */

import {
  LuxeBorderRadius,
  LuxeColors,
  LuxeSpacing,
} from "@/constants/luxeTheme";
import { useAuth } from "@/contexts/AuthContext";
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
import { Feather } from "@expo/vector-icons";
import { useConfirmDialog } from "@/components/ConfirmDialog";

const PASSWORD_MIN_LENGTH = 8;

interface FieldErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  apiError?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { confirm } = useConfirmDialog();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => {
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

    if (!fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Vui lòng nhập số điện thoại";
    }

    if (!email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Email không hợp lệ";
      }
    }

    if (!password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`;
    } else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(password)) {
        errors.password = "Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số";
      }
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const result = await register(
      phoneNumber.trim(),
      email.trim(),
      password,
      fullName.trim(),
    );

    setIsSubmitting(false);

    if (result.success) {
      confirm({
        title: "Đăng ký thành công",
        message: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
        confirmText: "OK",
        onConfirm: () => router.replace("/login"),
      });
    } else {
      setFieldErrors({ apiError: result.error || "Đăng ký thất bại. Vui lòng thử lại." });
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    keyboardType: "default" | "email-address" | "phone-pad" | "visible-password" = "default",
    secureTextEntry = false,
    autoCapitalize: "none" | "words" | "sentences" = "sentences",
    maxLength?: number,
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
          onChangeText={text => {
            onChangeText(text);
            clearFieldError(label as keyof FieldErrors);
          }}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Feather name="sun" size={40} color={LuxeColors.primaryContainer} />
            </View>
            <Text style={styles.title}>LuxeWash</Text>
            <Text style={styles.subtitle}>Rửa xe cao cấp</Text>
          </View>

          {/* Register Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Đăng ký tài khoản</Text>

            {/* API Error Banner */}
            {fieldErrors.apiError && (
              <View style={styles.apiErrorBanner}>
                <Text style={styles.apiErrorText}>{fieldErrors.apiError}</Text>
              </View>
            )}

            {renderInput(
              "Họ và tên",
              fullName,
              setFullName,
              "Nhập họ và tên",
              fieldErrors.fullName,
              "default",
              false,
              "words",
            )}

            {renderInput(
              "Số điện thoại",
              phoneNumber,
              setPhoneNumber,
              "Nhập số điện thoại",
              fieldErrors.phoneNumber,
              "phone-pad",
              false,
              "none",
              12,
            )}

            {renderInput(
              "Email",
              email,
              setEmail,
              "Nhập email",
              fieldErrors.email,
              "email-address",
              false,
              "none",
            )}

            {renderInput(
              "Mật khẩu",
              password,
              setPassword,
              `Ít nhất ${PASSWORD_MIN_LENGTH} ký tự, gồm 1 chữ hoa và 1 chữ số`,
              fieldErrors.password,
              "visible-password",
              true,
              "none",
              undefined,
              true,
              () => setShowPassword(prev => !prev),
              showPassword,
            )}

            {renderInput(
              "Xác nhận mật khẩu",
              confirmPassword,
              setConfirmPassword,
              "Nhập lại mật khẩu",
              fieldErrors.confirmPassword,
              "visible-password",
              true,
              "none",
              undefined,
              true,
              () => setShowConfirmPassword(prev => !prev),
              showConfirmPassword,
            )}

            <TouchableOpacity
              style={[styles.registerBtn, isSubmitting && styles.registerBtnDisabled]}
              onPress={validateAndSubmit}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerBtnText}>Đăng ký</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
  scrollContent: {
    flexGrow: 1,
    padding: LuxeSpacing.lg,
  },
  header: {
    alignItems: "center",
    marginTop: LuxeSpacing.xl,
    marginBottom: LuxeSpacing.lg,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LuxeColors.primaryContainer + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: LuxeSpacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: LuxeColors.primaryContainer,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.lg,
    textAlign: "center",
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
  registerBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: "center",
    marginTop: LuxeSpacing.sm,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: LuxeColors.primaryContainer,
  },
});

/**
 * Login Screen - LuxeWash
 * Phone number and password authentication
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }
    if (!password.trim()) {
      alert("Vui lòng nhập mật khẩu");
      return;
    }

    const result = await login({ phoneOrEmail: phoneNumber.trim(), password });

    if (result.success) {
      router.replace("/(main)" as any);
    } else {
      alert(result.error || "Vui lòng thử lại");
    }
  };

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

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Đăng nhập</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số điện thoại / Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại hoặc email"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={LuxeColors.onSurfaceVariant}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={LuxeColors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isLoggingIn && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/register" as any)}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    marginTop: LuxeSpacing.xl * 2,
    marginBottom: LuxeSpacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LuxeColors.primaryContainer + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: LuxeSpacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: LuxeColors.primaryContainer,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
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
  },
  inputContainer: {
    marginBottom: LuxeSpacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 8,
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
  loginBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: "center",
    marginTop: LuxeSpacing.md,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: LuxeSpacing.md,
  },
  registerText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: LuxeColors.primaryContainer,
  },
});

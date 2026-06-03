/**
 * Login Screen - LuxeWash
 * Professional bold redesign with solid white cards and brand accents
 */

import {
  LuxeBorderRadius,
  LuxeColors,
  LuxeSpacing,
  LuxeShadows,
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
      {/* Top Brand Accent Bar */}
      <View style={styles.brandStrip} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <Feather name="sun" size={36} color={LuxeColors.primaryContainer} />
              </View>
            </View>
            <Text style={styles.brandName}>LuxeWash</Text>
            <Text style={styles.brandTagline}>Premium Car Care</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Đăng nhập</Text>
            <Text style={styles.formSubtitle}>
              Chào mừng bạn quay trở lại
            </Text>

            {/* Phone / Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Số điện thoại / Email</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputIcon}>
                  <Feather name="user" size={18} color={LuxeColors.onSurfaceVariant} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại hoặc email"
                  placeholderTextColor={LuxeColors.outline}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mật khẩu</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputIcon}>
                  <Feather name="lock" size={18} color={LuxeColors.onSurfaceVariant} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={LuxeColors.outline}
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
                    size={18}
                    color={LuxeColors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoggingIn && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoggingIn}
              activeOpacity={0.85}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Đăng nhập</Text>
                  <Feather name="arrow-right" size={18} color="#ffffff" />
                </>
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

          {/* Footer */}
          <Text style={styles.footer}>LuxeWash v1.0.0</Text>
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
  brandStrip: {
    height: 5,
    backgroundColor: LuxeColors.primaryContainer,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  logoWrap: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: LuxeColors.primaryContainer + '40',
  },
  brandName: {
    fontSize: 30,
    fontWeight: "800",
    color: LuxeColors.primaryContainer,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: LuxeBorderRadius.xl,
    padding: 24,
    ...LuxeShadows.lg,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LuxeColors.background,
    borderRadius: LuxeBorderRadius.lg,
    borderWidth: 1.5,
    borderColor: LuxeColors.outlineVariant,
    overflow: "hidden",
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: LuxeColors.onSurface,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    paddingVertical: 16,
    marginTop: 8,
    ...LuxeShadows.primary,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  registerText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: LuxeColors.primaryContainer,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: LuxeColors.outline,
    marginTop: 8,
  },
});

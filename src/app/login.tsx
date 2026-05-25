/**
 * Login Screen - LuxeWash
 * Phone number and password authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, DEMO_ACCOUNTS } from '@/contexts/AuthContext';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ phoneNumber: phoneNumber.trim(), password });
    setIsSubmitting(false);

    if (result.success) {
      router.replace('/(main)' as any);
    } else {
      Alert.alert('Đăng nhập thất bại', result.error || 'Vui lòng thử lại');
    }
  };

  const handleDemoLogin = (phone: string, pass: string) => {
    setPhoneNumber(phone);
    setPassword(pass);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <Text style={styles.title}>LuxeWash</Text>
            <Text style={styles.subtitle}>Rửa xe cao cấp</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Đăng nhập</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={LuxeColors.onSurfaceVariant}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Demo Accounts */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Tài khoản demo (tap để điền):</Text>
            <View style={styles.demoList}>
              {DEMO_ACCOUNTS.slice(0, 5).map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.demoItem}
                  onPress={() => handleDemoLogin(account.phone, account.password)}
                >
                  <Text style={styles.demoRole}>
                    {account.role === 'staff' ? '👔' : '👤'}
                  </Text>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoName}>{account.name}</Text>
                    <Text style={styles.demoCredentials}>{account.phone} / {account.password}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    alignItems: 'center',
    marginTop: LuxeSpacing.xl * 2,
    marginBottom: LuxeSpacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LuxeSpacing.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.lg,
    marginBottom: LuxeSpacing.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.lg,
  },
  inputContainer: {
    marginBottom: LuxeSpacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
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
    borderColor: LuxeColors.outlineVariant + '30',
  },
  loginBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: 'center',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  demoSection: {
    marginTop: LuxeSpacing.md,
  },
  demoTitle: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: LuxeSpacing.sm,
    textAlign: 'center',
  },
  demoList: {
    gap: 8,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.sm,
    gap: LuxeSpacing.sm,
  },
  demoRole: {
    fontSize: 20,
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: 13,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  demoCredentials: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
  },
});

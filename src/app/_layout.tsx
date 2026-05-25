/**
 * LuxeWash App Root Layout
 * Handles auth state and redirects
 */

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname, Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LuxeColors } from '@/constants/luxeTheme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

const LuxeLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: LuxeColors.primary,
    background: LuxeColors.background,
    card: LuxeColors.surfaceContainerLowest,
    text: LuxeColors.onSurface,
    border: LuxeColors.outlineVariant,
    notification: LuxeColors.primaryContainer,
  },
};

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LuxeColors.background,
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={LuxeLightTheme}>
        <StatusBar style="dark" />
        <AuthProvider>
          <AnimatedSplashOverlay />
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.replace('/(main)' as any);
    }
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: LuxeColors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="(main)" />
      <Stack.Screen
        name="booking"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

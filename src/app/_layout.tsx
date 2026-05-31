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
import { useFonts } from 'expo-font';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LuxeColors } from '@/constants/luxeTheme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ConfirmDialogProvider } from '@/components/ConfirmDialog';

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
  const [fontsLoaded] = useFonts({
    Feather: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={LuxeLightTheme}>
        <StatusBar style="dark" />
        <AuthProvider>
          <ConfirmDialogProvider>
            <AnimatedSplashOverlay />
            <AppNavigator />
          </ConfirmDialogProvider>
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

    if (!isAuthenticated && pathname !== '/login' && pathname !== '/register') {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/(main)' as any);
    } else if (!isAuthenticated && (pathname === '/change-password' || pathname.startsWith('/vouchers') || pathname === '/profile-edit')) {
      router.replace('/login');
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
      <Stack.Screen name="register" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="(main)" />
      <Stack.Screen
        name="booking"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="wallet"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="vouchers"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

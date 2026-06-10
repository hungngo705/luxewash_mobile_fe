/**
 * LuxeWash App Root Layout
 * Handles auth state and redirects
 */

import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, usePathname, Stack, useNavigationContainerRef } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

/**
 * Inner navigator — must be rendered inside expo-router's context
 * so that useRootNavigation() and useRootNavigator() work.
 */
function InnerNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useNavigationContainerRef();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && pathname !== '/login' && pathname !== '/register' && pathname !== '/verify-otp') {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/(main)' as any);
    }
  }, [isLoading, isAuthenticated, pathname]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const state = containerRef.current?.getRootState();
      if (state && state.routes.length <= 1) {
        router.replace('/(main)' as any);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes("The action 'GO_BACK' was not handled by any navigator")
      ) {
        return;
      }
      originalError.apply(console, args as Parameters<typeof console.error>);
    };
    return () => {
      console.error = originalError as typeof console.error;
    };
  }, []);

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
      <Stack.Screen name="verify-otp" />
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

function AppNavigator() {
  return <InnerNavigator />;
}

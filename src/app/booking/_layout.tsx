/**
 * Booking Stack Layout
 * Hides the tab bar when navigating to booking screens
 */

import { Stack } from 'expo-router';
import { LuxeColors } from '@/constants/luxeTheme';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: LuxeColors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="select-vehicle" />
      <Stack.Screen name="select-date" />
      <Stack.Screen name="select-service" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="success" />
    </Stack>
  );
}

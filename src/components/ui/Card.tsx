/**
 * Unified white card component with consistent shadow and border styling
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, LuxeShadows } from '@/constants/luxeTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  noPadding?: boolean;
}

export function Card({ children, style, padding = LuxeSpacing.md, noPadding = false }: CardProps) {
  return (
    <View style={[styles.card, noPadding ? {} : { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: LuxeBorderRadius.xl,
    ...LuxeShadows.sm,
  },
});

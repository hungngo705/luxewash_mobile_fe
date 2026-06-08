import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <View style={styles.button}>
          <SymbolView
            name="chevron.right"
            size={14}
            weight="bold"
            tintColor={LuxeColors.onSurface}
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.sm,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: LuxeBorderRadius.md,
    backgroundColor: LuxeColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurface,
  },
  content: {
    marginTop: LuxeSpacing.md,
    marginLeft: 28,
    padding: LuxeSpacing.md,
    backgroundColor: LuxeColors.surfaceVariant,
    borderRadius: LuxeBorderRadius.md,
  },
});

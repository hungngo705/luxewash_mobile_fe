/**
 * Main Tabs Layout
 * Contains the 4 main tabs: Home, Appointments, Rewards, Profile
 */

import { LuxeColors } from "@/constants/luxeTheme";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{icon}</Text>
      {focused && <View style={styles.focusedDot} />}
    </View>
  );
}

export default function MainTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: LuxeColors.primaryContainer,
        tabBarInactiveTintColor: LuxeColors.onSurfaceVariant,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Lịch hẹn",
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Phần thưởng",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + "30",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  icon: {
    fontSize: 22,
  },
  focusedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: LuxeColors.primaryContainer,
    marginTop: 2,
  },
});

/**
 * Profile Screen
 * User profile, settings and logout
 */

import {
  LuxeBorderRadius,
  LuxeColors,
  LuxeSpacing,
  MembershipConfig,
} from "@/constants/luxeTheme";
import { useAuth } from "@/contexts/AuthContext";
import { mockVehicles } from "@/data/types";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useConfirmDialog } from "@/components/ConfirmDialog";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, walletBalance, logout } = useAuth();
  const { confirm } = useConfirmDialog();

  const currentUser = user;
  const membershipInfo = currentUser
    ? MembershipConfig[currentUser.membershipTier]
    : MembershipConfig.standard;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

  const menuItems = [
    {
      icon: "dollar-sign",
      iconColor: "#1565C0",
      title: "Ví & Thanh toán",
      subtitle: `Số dư: ${formatCurrency(walletBalance)}`,
      onPress: () => router.push("/wallet" as any),
    },
    {
      icon: "gift",
      iconColor: "#C62828",
      title: "Voucher",
      subtitle: "Kho voucher & điểm thưởng",
      onPress: () => router.push("/vouchers" as any),
    },
    {
      icon: "lock",
      iconColor: "#2E7D32",
      title: "Bảo mật",
      subtitle: "Đổi mật khẩu",
      onPress: () => router.push("/change-password"),
    },
    { icon: "bell", iconColor: "#F57C00", title: "Thông báo", subtitle: "Cài đặt thông báo" },
    { icon: "help-circle", iconColor: "#7B1FA2", title: "Hỗ trợ", subtitle: "Liên hệ, FAQ" },
  ];

  const handleLogout = () => {
    confirm({
      title: "Đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất?",
      confirmText: "Đăng xuất",
      destructive: true,
      onConfirm: async () => {
        await logout();
        router.replace("/login");
      },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push('/profile-edit' as any)}
            >
              <Feather name="edit-2" size={14} color={LuxeColors.primaryContainer} />
              <Text style={styles.editProfileBtnText}> Sửa</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.name?.charAt(0) || "U"}
              </Text>
            </View>
            <Text style={styles.userName}>{currentUser?.name || "Khách"}</Text>
            <Text style={styles.userPhone}>
              {currentUser?.phoneNumber || ""}
            </Text>
            <View
              style={[
                styles.membershipBadge,
                { backgroundColor: membershipInfo.color + "20" },
              ]}
            >
              <Text
                style={[
                  styles.membershipBadgeText,
                  { color: membershipInfo.color },
                ]}
              >
                {membershipInfo.nameVi}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoValue}>
                  {currentUser?.loyaltyPoints?.toLocaleString("vi-VN") || "0"}
                </Text>
                <Text style={styles.infoLabel}>Điểm</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoValue}>
                  {currentUser?.vehicles?.length || mockVehicles.length}
                </Text>
                <Text style={styles.infoLabel}>Xe</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoValue}>12</Text>
                <Text style={styles.infoLabel}>Lần rửa</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: LuxeColors.primaryContainer + "20" },
                ]}
              >
                <Feather name="calendar" size={20} color={LuxeColors.primaryContainer} />
              </View>
              <Text style={styles.quickActionText}>Lịch hẹn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: LuxeColors.tertiaryContainer + "30" },
                ]}
              >
                <Feather name="tag" size={20} color={LuxeColors.tertiaryContainer} />
              </View>
              <Text style={styles.quickActionText}>Voucher</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#F59E0B20" },
                ]}
              >
                <Feather name="star" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionText}>Đánh giá</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: LuxeColors.secondaryContainer + "40" },
                ]}
              >
                <Feather name="share-2" size={20} color={LuxeColors.secondaryContainer} />
              </View>
              <Text style={styles.quickActionText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>

          {/* Menu List */}
          <View style={styles.menuSection}>
            {user?.role === "customer" && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/vehicles" as any)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: LuxeColors.primaryContainer + '20' }]}>
                    <Feather name="truck" size={18} color={LuxeColors.primaryContainer} />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuTitle}>Xe của tôi</Text>
                    <Text style={styles.menuSubtitle}>
                      {user.vehicles.length}/5 xe đã đăng ký
                    </Text>
                  </View>
                </View>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            )}
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: item.iconColor + '20' }]}>
                    <Feather name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
            {user?.role === "staff" && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/staff/lpr-checkin" as any)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: LuxeColors.primaryContainer + '20' }]}>
                    <Feather name="truck" size={18} color={LuxeColors.primaryContainer} />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuTitle}>Chế độ Staff</Text>
                    <Text style={styles.menuSubtitle}>LPR Check-in</Text>
                  </View>
                </View>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#DC2626" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.version}>LuxeWash v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.lg,
    paddingTop: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.xl,
    alignItems: "center",
    marginBottom: LuxeSpacing.lg,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 5,
  },
  editProfileBtn: {
    position: 'absolute',
    top: LuxeSpacing.md,
    right: LuxeSpacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: LuxeColors.primaryContainer + '30',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: LuxeSpacing.md,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 8,
  },
  membershipBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: LuxeSpacing.lg,
  },
  membershipBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: LuxeSpacing.md,
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + "30",
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: LuxeColors.onSurface,
  },
  infoLabel: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 4,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: LuxeColors.outlineVariant + "30",
  },
  quickActions: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: LuxeBorderRadius.lg,
    marginBottom: LuxeSpacing.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: LuxeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + "20",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: LuxeSpacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: LuxeColors.onSurface,
  },
  menuSubtitle: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  menuChevron: {
    fontSize: 20,
    color: LuxeColors.onSurfaceVariant,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    gap: 8,
    marginBottom: LuxeSpacing.lg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: LuxeSpacing.lg,
  },
});

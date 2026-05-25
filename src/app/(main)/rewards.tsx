/**
 * Rewards Screen
 * Shows loyalty points and available rewards
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { mockRewardHistory } from '@/data/types';

export default function RewardsScreen() {
  const { user } = useAuth();
  const currentUser = user;
  const membershipInfo = currentUser ? MembershipConfig[currentUser.membershipTier] : MembershipConfig.standard;

  const rewards = [
    {
      id: '1',
      title: 'Miễn phí rửa tiêu chuẩn',
      points: 500,
      description: 'Đổi 500 điểm để nhận 1 lần rửa xe tiêu chuẩn miễn phí',
    },
    {
      id: '2',
      title: 'Giảm 50% dịch vụ premium',
      points: 300,
      description: 'Đổi 300 điểm để nhận voucher giảm 50% cho gói premium',
    },
    {
      id: '3',
      title: 'Tặng 1 lần hút bụi miễn phí',
      points: 200,
      description: 'Đổi 200 điểm để nhận 1 lần hút bụi nội thất miễn phí',
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Points Card */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <Text style={styles.pointsLabel}>Số dư hiện tại</Text>
            </View>
            <View style={styles.pointsDisplay}>
              <Text style={styles.pointsValue}>{currentUser?.loyaltyPoints?.toLocaleString('vi-VN') || '0'}</Text>
              <Text style={styles.pointsUnit}>Điểm</Text>
            </View>
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipLabel}>Cấp độ thành viên</Text>
              <View style={[styles.membershipBadge, { backgroundColor: membershipInfo.color + '20' }]}>
                <Text style={[styles.membershipBadgeText, { color: membershipInfo.color }]}>
                  {membershipInfo.nameVi}
                </Text>
              </View>
            </View>
          </View>

          {/* Membership Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích khả dụng</Text>
            <View style={styles.benefitsGrid}>
              {membershipInfo.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitCard}>
                  <View style={styles.benefitIcon}>
                    <Text style={styles.benefitIconText}>
                      {index === 0 ? '☕' : index === 1 ? '✅' : index === 2 ? '⚡' : '🎁'}
                    </Text>
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Redeemable Rewards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đổi phần thưởng</Text>
            {rewards.map((reward) => (
              <TouchableOpacity key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardDesc}>{reward.description}</Text>
                </View>
                <View style={styles.rewardAction}>
                  <Text style={styles.rewardPoints}>{reward.points} điểm</Text>
                  <View style={styles.redeemBtn}>
                    <Text style={styles.redeemBtnText}>Đổi</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* How to Earn */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cách tích điểm</Text>
            <View style={styles.earnCard}>
              <View style={styles.earnItem}>
                <Text style={styles.earnIcon}>🚗</Text>
                <View style={styles.earnInfo}>
                  <Text style={styles.earnTitle}>Sử dụng dịch vụ</Text>
                  <Text style={styles.earnDesc}>1 điểm/10.000đ thanh toán</Text>
                </View>
              </View>
              <View style={styles.earnItem}>
                <Text style={styles.earnIcon}>⭐</Text>
                <View style={styles.earnInfo}>
                  <Text style={styles.earnTitle}>Đánh giá dịch vụ</Text>
                  <Text style={styles.earnDesc}>+50 điểm/đánh giá</Text>
                </View>
              </View>
              <View style={styles.earnItem}>
                <Text style={styles.earnIcon}>🎂</Text>
                <View style={styles.earnInfo}>
                  <Text style={styles.earnTitle}>Sinh nhật</Text>
                  <Text style={styles.earnDesc}>+200 điểm vào ngày sinh nhật</Text>
                </View>
              </View>
            </View>
          </View>
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
  pointsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.xl,
    alignItems: 'center',
    marginBottom: LuxeSpacing.xl,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 5,
  },
  pointsHeader: {
    marginBottom: LuxeSpacing.sm,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: LuxeSpacing.md,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  pointsUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: LuxeColors.primaryContainer,
    marginLeft: 8,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  membershipLabel: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  membershipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  membershipBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: LuxeSpacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.md,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LuxeSpacing.md,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
  },
  benefitIcon: {
    marginBottom: 8,
  },
  benefitIconText: {
    fontSize: 28,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '500',
    color: LuxeColors.onSurface,
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    marginBottom: LuxeSpacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant + '30',
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  rewardDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
  },
  rewardAction: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  redeemBtn: {
    backgroundColor: LuxeColors.primaryContainer + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: LuxeBorderRadius.md,
    marginTop: 8,
  },
  redeemBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  earnCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    gap: LuxeSpacing.md,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LuxeSpacing.md,
  },
  earnIcon: {
    fontSize: 28,
  },
  earnInfo: {
    flex: 1,
  },
  earnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  earnDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
});

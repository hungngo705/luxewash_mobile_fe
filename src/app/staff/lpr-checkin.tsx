/**
 * LPR Check-in Staff Screen
 * Displays real-time vehicle recognition and queue management
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig, MembershipTier } from '@/constants/luxeTheme';
import { mockCheckInRecords, CheckInRecord, LPRResult } from '@/data/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DetectedVehicle extends LPRResult {
  userId?: string;
  userName?: string;
  membershipTier?: MembershipTier;
  vehicleId?: string;
  bookingId?: string;
  status: 'detecting' | 'recognized' | 'not_found';
}

export default function LPRCheckInScreen() {
  const [detectedPlate, setDetectedPlate] = useState<DetectedVehicle | null>(null);
  const [queueItems] = useState<CheckInRecord[]>(mockCheckInRecords);
  const [isScanning, setIsScanning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const scanAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const simulateDetection = () => {
      setTimeout(() => {
        const mockDetections: DetectedVehicle[] = [
          { plateNumber: '30A-888.88', confidence: 0.98, timestamp: new Date(), status: 'recognized', userId: 'user_001', userName: 'Nguyễn Văn Minh', membershipTier: 'gold', vehicleId: 'veh_001', bookingId: 'BK001' },
          { plateNumber: '29A-111.11', confidence: 0.95, timestamp: new Date(), status: 'recognized', userId: 'user_002', userName: 'Trần Thị Hương', membershipTier: 'platinum', vehicleId: 'veh_004', bookingId: 'BK002' },
          { plateNumber: '60A-222.22', confidence: 0.92, timestamp: new Date(), status: 'not_found' },
        ];
        setDetectedPlate(mockDetections[Math.floor(Math.random() * mockDetections.length)]);
        setLastUpdate(new Date());
        setIsScanning(false);
      }, 3000);
    };

    const interval = setInterval(() => {
      if (!isScanning) {
        setIsScanning(true);
        setDetectedPlate(null);
        simulateDetection();
      }
    }, 15000);

    simulateDetection();
    return () => clearInterval(interval);
  }, [isScanning]);

  const getMembershipBadgeStyle = (tier: MembershipTier) => {
    const config = MembershipConfig[tier];
    return { backgroundColor: config.color + '20', borderColor: config.color, textColor: config.color };
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoIcon}>💧</Text>
          <Text style={styles.logoText}>LuxeWash</Text>
        </View>
        <View style={styles.stationBadge}>
          <Text style={styles.stationBadgeText}>Trạm Q1</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.lprPanel}>
          <View style={styles.lprHeader}>
            <Text style={styles.panelTitle}>Camera nhận diện</Text>
            <View style={styles.lprStatus}>
              <View style={[styles.statusDot, isScanning ? styles.statusDotActive : styles.statusDotSuccess]} />
              <Text style={styles.statusText}>{isScanning ? 'Đang quét...' : 'Đã nhận diện'}</Text>
            </View>
          </View>

          <View style={styles.cameraView}>
            <Animated.View style={[styles.scanLine, { top: scanAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_HEIGHT * 0.3] }) }]} />
            <View style={styles.gridOverlay}>
              <View style={[styles.gridLine, styles.gridLineHorizontal]} />
              <View style={[styles.gridLine, styles.gridLineVertical]} />
              <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '50%' }]} />
              <View style={[styles.gridLine, styles.gridLineVertical, { left: '50%' }]} />
            </View>

            {detectedPlate ? (
              <Animated.View style={[styles.detectionResult, { transform: [{ scale: pulseAnimation }] }]}>
                <View style={styles.plateOverlay}>
                  <Text style={styles.plateLabel}>BIỂN SỐ</Text>
                  <Text style={styles.plateNumber}>{detectedPlate.plateNumber}</Text>
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: `${detectedPlate.confidence * 100}%` }]} />
                  </View>
                  <Text style={styles.confidenceText}>Độ chính xác: {Math.round(detectedPlate.confidence * 100)}%</Text>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.scanPrompt}>
                <Text style={styles.scanPromptText}>Đưa xe vào cổng</Text>
                <Text style={styles.scanPromptSubtext}>Hệ thống sẽ tự động nhận diện trong 10 giây</Text>
              </View>
            )}
          </View>

          {detectedPlate && detectedPlate.status === 'recognized' && (
            <View style={styles.vehicleInfoCard}>
              <View style={styles.vehicleInfoHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.avatarText}>{detectedPlate.userName?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.vehicleInfoContent}>
                  <Text style={styles.customerName}>{detectedPlate.userName}</Text>
                  <View style={[styles.membershipBadge, getMembershipBadgeStyle(detectedPlate.membershipTier!)]}>
                    <Text style={[styles.membershipBadgeText, { color: getMembershipBadgeStyle(detectedPlate.membershipTier!).textColor }]}>
                      {MembershipConfig[detectedPlate.membershipTier!].nameVi}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.bookingInfo}>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>Mã đặt lịch:</Text>
                  <Text style={styles.bookingValue}>{detectedPlate.bookingId}</Text>
                </View>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>Loại xe:</Text>
                  <Text style={styles.bookingValue}>Mercedes-Benz S500</Text>
                </View>
              </View>
            </View>
          )}

          {detectedPlate && detectedPlate.status === 'not_found' && (
            <View style={styles.notFoundCard}>
              <Text style={styles.notFoundIcon}>?</Text>
              <Text style={styles.notFoundTitle}>Không tìm thấy</Text>
              <Text style={styles.notFoundText}>Xe không có trong hệ thống. Vui lòng kiểm tra lại hoặc thêm xe mới.</Text>
              <TouchableOpacity style={styles.addVehicleBtn}>
                <Text style={styles.addVehicleBtnText}>+ Thêm xe mới</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.queuePanel}>
          <View style={styles.queueHeader}>
            <Text style={styles.panelTitle}>Hàng đợi</Text>
            <View style={styles.queueStats}>
              <View style={styles.queueStat}>
                <Text style={styles.queueStatValue}>{queueItems.length}</Text>
                <Text style={styles.queueStatLabel}>Đang chờ</Text>
              </View>
              <View style={styles.queueDivider} />
              <View style={styles.queueStat}>
                <Text style={[styles.queueStatValue, { color: LuxeColors.primaryContainer }]}>{queueItems.filter((i) => i.isPriority).length}</Text>
                <Text style={styles.queueStatLabel}>VIP</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
            <View style={styles.laneHeader}>
              <Text style={styles.laneTitle}>Làn ưu tiên (Platinum/Diamond)</Text>
            </View>
            {queueItems.filter((item) => item.isPriority).map((item, index) => (
              <View key={item.id} style={[styles.queueItem, styles.priorityQueueItem]}>
                <View style={styles.queuePosition}><Text style={styles.queuePositionText}>{index + 1}</Text></View>
                <View style={styles.queueInfo}>
                  <View style={styles.queueVehicle}>
                    <Text style={styles.queuePlate}>{item.licensePlate}</Text>
                    <View style={[styles.membershipBadgeSmall, { backgroundColor: MembershipConfig[item.membershipTier].color + '20' }]}>
                      <Text style={[styles.membershipBadgeSmallText, { color: MembershipConfig[item.membershipTier].color }]}>{MembershipConfig[item.membershipTier].nameVi}</Text>
                    </View>
                  </View>
                  <Text style={styles.queueTime}>{formatTime(item.checkInTime)}</Text>
                </View>
                <View style={styles.queueLane}><Text style={styles.queueLaneText}>Làn VIP</Text></View>
              </View>
            ))}
            {queueItems.filter((item) => item.isPriority).length === 0 && <View style={styles.emptyQueue}><Text style={styles.emptyQueueText}>Không có xe trong làn ưu tiên</Text></View>}

            <View style={[styles.laneHeader, styles.regularLaneHeader]}>
              <Text style={styles.laneTitle}>Làn thường</Text>
            </View>
            {queueItems.filter((item) => !item.isPriority).map((item, index) => (
              <View key={item.id} style={styles.queueItem}>
                <View style={styles.queuePosition}><Text style={styles.queuePositionText}>{index + 1}</Text></View>
                <View style={styles.queueInfo}>
                  <View style={styles.queueVehicle}>
                    <Text style={styles.queuePlate}>{item.licensePlate}</Text>
                    <View style={[styles.membershipBadgeSmall, { backgroundColor: MembershipConfig[item.membershipTier].color + '20' }]}>
                      <Text style={[styles.membershipBadgeSmallText, { color: MembershipConfig[item.membershipTier].color }]}>{MembershipConfig[item.membershipTier].nameVi}</Text>
                    </View>
                  </View>
                  <Text style={styles.queueTime}>{formatTime(item.checkInTime)}</Text>
                </View>
                <View style={[styles.queueLane, styles.regularLaneBadge]}><Text style={[styles.queueLaneText, { color: LuxeColors.secondary }]}>Làn {index + 1}</Text></View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Cập nhật lần cuối: {formatTime(lastUpdate)}</Text>
        <TouchableOpacity style={styles.refreshBtn}><Text style={styles.refreshBtnText}>Làm mới</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: LuxeSpacing.lg, paddingVertical: LuxeSpacing.md, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottomWidth: 1, borderBottomColor: LuxeColors.outlineVariant + '30' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 24 },
  logoText: { fontSize: 20, fontWeight: '700', color: LuxeColors.primaryContainer },
  stationBadge: { backgroundColor: LuxeColors.primaryContainer + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  stationBadgeText: { fontSize: 12, fontWeight: '600', color: LuxeColors.primaryContainer },
  mainContent: { flex: 1, flexDirection: 'row' },
  lprPanel: { flex: 1, padding: LuxeSpacing.md },
  lprHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: LuxeSpacing.md },
  panelTitle: { fontSize: 16, fontWeight: '600', color: LuxeColors.onSurface },
  lprStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotActive: { backgroundColor: LuxeColors.tertiaryContainer },
  statusDotSuccess: { backgroundColor: LuxeColors.primaryContainer },
  statusText: { fontSize: 12, color: LuxeColors.onSurfaceVariant },
  cameraView: { height: SCREEN_HEIGHT * 0.3, backgroundColor: '#1a1a2e', borderRadius: LuxeBorderRadius.xl, overflow: 'hidden', position: 'relative' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: LuxeColors.primaryContainer, shadowColor: LuxeColors.primaryContainer, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  gridOverlay: { ...StyleSheet.absoluteFill },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  gridLineHorizontal: { left: 0, right: 0, height: 1, top: '25%' },
  gridLineVertical: { top: 0, bottom: 0, width: 1, left: '25%' },
  scanPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanPromptText: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 8 },
  scanPromptSubtext: { fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' },
  detectionResult: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  plateOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: LuxeSpacing.md, borderRadius: LuxeBorderRadius.lg, alignItems: 'center', minWidth: 200 },
  plateLabel: { fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 },
  plateNumber: { fontSize: 28, fontWeight: '700', color: '#ffffff', letterSpacing: 2 },
  confidenceBar: { width: '100%', height: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  confidenceFill: { height: '100%', backgroundColor: LuxeColors.primaryContainer, borderRadius: 2 },
  confidenceText: { fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 },
  vehicleInfoCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: LuxeBorderRadius.xl, padding: LuxeSpacing.md, marginTop: LuxeSpacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  vehicleInfoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: LuxeSpacing.md },
  customerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: LuxeColors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  vehicleInfoContent: { marginLeft: LuxeSpacing.md },
  customerName: { fontSize: 18, fontWeight: '600', color: LuxeColors.onSurface },
  membershipBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4 },
  membershipBadgeText: { fontSize: 12, fontWeight: '600' },
  bookingInfo: { borderTopWidth: 1, borderTopColor: LuxeColors.outlineVariant + '30', paddingTop: LuxeSpacing.md },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  bookingLabel: { fontSize: 13, color: LuxeColors.onSurfaceVariant },
  bookingValue: { fontSize: 13, fontWeight: '500', color: LuxeColors.onSurface },
  notFoundCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: LuxeBorderRadius.xl, padding: LuxeSpacing.lg, marginTop: LuxeSpacing.md, alignItems: 'center' },
  notFoundIcon: { fontSize: 48, marginBottom: LuxeSpacing.md },
  notFoundTitle: { fontSize: 18, fontWeight: '600', color: LuxeColors.onSurface, marginBottom: 8 },
  notFoundText: { fontSize: 14, color: LuxeColors.onSurfaceVariant, textAlign: 'center', marginBottom: LuxeSpacing.md },
  addVehicleBtn: { backgroundColor: LuxeColors.primaryContainer, paddingHorizontal: LuxeSpacing.lg, paddingVertical: LuxeSpacing.sm, borderRadius: LuxeBorderRadius.md },
  addVehicleBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  queuePanel: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderLeftWidth: 1, borderLeftColor: LuxeColors.outlineVariant + '30', padding: LuxeSpacing.md },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: LuxeSpacing.md },
  queueStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  queueStat: { alignItems: 'center' },
  queueStatValue: { fontSize: 20, fontWeight: '700', color: LuxeColors.onSurface },
  queueStatLabel: { fontSize: 10, color: LuxeColors.onSurfaceVariant, textTransform: 'uppercase' },
  queueDivider: { width: 1, height: 30, backgroundColor: LuxeColors.outlineVariant + '30' },
  queueList: { flex: 1 },
  laneHeader: { backgroundColor: '#8B5CF6' + '20', paddingHorizontal: LuxeSpacing.sm, paddingVertical: 6, borderRadius: LuxeBorderRadius.sm, marginBottom: LuxeSpacing.sm },
  regularLaneHeader: { backgroundColor: LuxeColors.secondaryContainer + '40', marginTop: LuxeSpacing.md },
  laneTitle: { fontSize: 12, fontWeight: '600', color: '#8B5CF6' },
  queueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: LuxeBorderRadius.lg, padding: LuxeSpacing.sm, marginBottom: 8 },
  priorityQueueItem: { backgroundColor: '#8B5CF6' + '10', borderWidth: 1, borderColor: '#8B5CF6' + '30' },
  queuePosition: { width: 28, height: 28, borderRadius: 14, backgroundColor: LuxeColors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: LuxeSpacing.sm },
  queuePositionText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  queueInfo: { flex: 1 },
  queueVehicle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  queuePlate: { fontSize: 14, fontWeight: '600', color: LuxeColors.onSurface },
  membershipBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  membershipBadgeSmallText: { fontSize: 10, fontWeight: '600' },
  queueTime: { fontSize: 11, color: LuxeColors.onSurfaceVariant, marginTop: 2 },
  queueLane: { backgroundColor: '#8B5CF6' + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  regularLaneBadge: { backgroundColor: LuxeColors.secondaryContainer + '40' },
  queueLaneText: { fontSize: 11, fontWeight: '600', color: '#8B5CF6' },
  emptyQueue: { padding: LuxeSpacing.lg, alignItems: 'center' },
  emptyQueueText: { fontSize: 13, color: LuxeColors.onSurfaceVariant },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: LuxeSpacing.lg, paddingVertical: LuxeSpacing.sm, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderTopWidth: 1, borderTopColor: LuxeColors.outlineVariant + '30' },
  footerText: { fontSize: 11, color: LuxeColors.onSurfaceVariant },
  refreshBtn: { paddingHorizontal: LuxeSpacing.md, paddingVertical: 6, backgroundColor: LuxeColors.primaryContainer + '20', borderRadius: LuxeBorderRadius.md },
  refreshBtnText: { fontSize: 12, fontWeight: '600', color: LuxeColors.primaryContainer },
});

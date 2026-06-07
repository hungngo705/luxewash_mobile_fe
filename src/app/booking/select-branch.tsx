/**
 * Advance Booking Flow - Step 0: Select Branch
 * Redesigned with two tabs:
 *   - "Gần đây": all branches sorted by distance from user's GPS location
 *   - "Đã đặt": up to 3 recently booked branches (unique, most recent first)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeShadows } from '@/constants/luxeTheme';
import { branchService, type BranchDTO } from '@/services/api';
import {
  locationService,
  getCurrentPosition,
  geocodeBranches,
  calculateDistance,
  formatDistance,
  type GeoPoint,
} from '@/services/locationService';
import { branchHistoryService, type RecentBranch } from '@/services/branchHistoryService';
import { Header } from '@/components/ui/Header';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { BottomActionBar } from '@/components/ui/BottomActionBar';

type Tab = 'nearby' | 'recent';

interface BranchWithDistance extends BranchDTO {
  distance?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function resolveBranchLocations(
  branches: BranchDTO[],
  userLocation: GeoPoint | null,
  onProgress?: (done: number, total: number) => void,
): Promise<BranchWithDistance[]> {
  // Build coordinate map: uses cached coords, API coords, or geocoded addresses
  const coordsMap = await geocodeBranches(branches, onProgress);

  const resolved = branches.map((branch) => {
    const coords = coordsMap.get(branch.branchId);
    const distance =
      coords && userLocation
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            coords.latitude,
            coords.longitude,
          )
        : undefined;

    return { ...branch, distance };
  });

  return resolved.sort((a, b) => {
    if (a.distance == null && b.distance == null) return 0;
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });
}

/* ------------------------------------------------------------------ */
/*  Branch Card                                                        */
/* ------------------------------------------------------------------ */

interface BranchCardProps {
  branch: BranchDTO;
  isSelected: boolean;
  onSelect: (branch: BranchDTO) => void;
  distance?: number;
  isNearest?: boolean;
  showClock?: boolean;
}

function BranchCard({
  branch,
  isSelected,
  onSelect,
  distance,
  isNearest,
  showClock,
}: BranchCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.branchCard,
        isSelected && styles.branchCardSelected,
        isNearest && !isSelected && styles.branchCardNearest,
      ]}
      onPress={() => onSelect(branch)}
      activeOpacity={0.8}
    >
      {/* Radio indicator */}
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>

      <View style={styles.branchIconWrap}>
        <Feather
          name={showClock ? 'clock' : 'map-pin'}
          size={24}
          color={
            isSelected
              ? LuxeColors.primaryContainer
              : LuxeColors.onSurfaceVariant
          }
        />
      </View>

      <View style={styles.branchInfo}>
        <View style={styles.branchNameRow}>
          <Text
            style={[
              styles.branchName,
              isSelected && styles.branchNameSelected,
            ]}
            numberOfLines={1}
          >
            {branch.name}
          </Text>
          {isNearest && (
            <View style={styles.nearestBadge}>
              <Feather name="navigation" size={10} color="#fff" />
              <Text style={styles.nearestBadgeText}>Gần bạn nhất</Text>
            </View>
          )}
        </View>
        {branch.address && (
          <Text style={styles.branchAddress} numberOfLines={2}>
            <Feather name="map" size={11} color={LuxeColors.onSurfaceVariant} />{' '}
            {branch.address}
          </Text>
        )}
        {distance != null && (
          <View style={styles.distanceRow}>
            <Feather name="navigation" size={11} color={LuxeColors.primaryContainer} />
            <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
          </View>
        )}
      </View>

      {isSelected && (
        <View style={styles.checkBadge}>
          <Feather name="check" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Segment Control                                                */
/* ------------------------------------------------------------------ */

function TabSegment({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <View style={styles.tabSegment}>
      <TouchableOpacity
        style={[styles.tabBtn, active === 'nearby' && styles.tabBtnActive]}
        onPress={() => onChange('nearby')}
        activeOpacity={0.8}
      >
        <Feather
          name="navigation"
          size={14}
          color={active === 'nearby' ? '#fff' : LuxeColors.onSurfaceVariant}
        />
        <Text style={[styles.tabBtnText, active === 'nearby' && styles.tabBtnTextActive]}>
          Gần đây
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, active === 'recent' && styles.tabBtnActive]}
        onPress={() => onChange('recent')}
        activeOpacity={0.8}
      >
        <Feather
          name="clock"
          size={14}
          color={active === 'recent' ? '#fff' : LuxeColors.onSurfaceVariant}
        />
        <Text style={[styles.tabBtnText, active === 'recent' && styles.tabBtnTextActive]}>
          Đã đặt
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Location Permission Banner                                         */
/* ------------------------------------------------------------------ */

function LocationBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerIcon}>
        <Feather name="map-pin" size={18} color={LuxeColors.primaryContainer} />
      </View>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>Bật định vị để xem chi nhánh gần nhất</Text>
        <Text style={styles.bannerSub}>Chi nhánh sẽ được sắp xếp theo khoảng cách</Text>
      </View>
      <TouchableOpacity style={styles.bannerBtn} onPress={onOpenSettings}>
        <Text style={styles.bannerBtnText}>Bật</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */

export default function SelectBranchScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('nearby');
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [branchesWithDistance, setBranchesWithDistance] = useState<BranchWithDistance[]>([]);
  const [recentBranches, setRecentBranches] = useState<RecentBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState<string>('');

  /* Load all branches once */
  const loadBranches = useCallback(async () => {
    try {
      setError(null);
      const res = await branchService.getBranches();
      if (res.statusCode === 200 && res.data) {
        setBranches(res.data);
      } else {
        setError('Không thể tải danh sách chi nhánh');
      }
    } catch {
      setError('Không thể tải danh sách chi nhánh');
    }
  }, []);

  /* Resolve distances when branches or tab changes */
  const resolveDistances = useCallback(async () => {
    if (branches.length === 0) return;
    setLoadingNearby(true);
    setGeocodingProgress('');
    try {
      const userLocation = await getCurrentPosition();
      setLocationDenied(userLocation === null);

      const withDist = await resolveBranchLocations(
        branches,
        userLocation,
        (done, total) => {
          if (done < total) {
            setGeocodingProgress(`Đang tìm vị trí (${done}/${total})...`);
          }
        },
      );
      setBranchesWithDistance(withDist);
      setGeocodingProgress('');
    } finally {
      setLoadingNearby(false);
    }
  }, [branches]);

  /* Load recent branches from storage */
  const loadRecentBranches = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const recent = await branchHistoryService.getRecentBranches();
      setRecentBranches(recent);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadBranches();
      await loadRecentBranches();
      setLoading(false);
    };
    init();
  }, [loadBranches, loadRecentBranches]);

  /* Resolve distances when switching to nearby tab */
  useEffect(() => {
    if (activeTab === 'nearby' && branches.length > 0) {
      resolveDistances();
    }
  }, [activeTab, branches, resolveDistances]);

  /* Refresh handler */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'nearby') {
      await loadBranches();
      setBranchesWithDistance([]);
      await resolveDistances();
    } else {
      await loadRecentBranches();
    }
    setRefreshing(false);
  }, [activeTab, loadBranches, loadRecentBranches, resolveDistances]);

  /* When a tab changes, reload its data */
  const handleTabChange = useCallback(
    async (tab: Tab) => {
      setActiveTab(tab);
      setSelectedBranch(null);
      if (tab === 'nearby') {
        if (branchesWithDistance.length === 0) {
          setLoadingNearby(true);
          await resolveDistances();
          setLoadingNearby(false);
        }
      } else {
        setLoadingRecent(true);
        await loadRecentBranches();
        setLoadingRecent(false);
      }
    },
    [branchesWithDistance.length, resolveDistances, loadRecentBranches],
  );

  const handleSelectBranch = useCallback((branch: BranchDTO) => {
    setSelectedBranch(branch);
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedBranch) return;
    router.push({
      pathname: '/booking/select-vehicles',
      params: {
        branchId: String(selectedBranch.branchId),
        branchName: selectedBranch.name,
      },
    });
  }, [selectedBranch, router]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  const renderBranchList = (list: BranchWithDistance[], showDistances: boolean) => {
    if (loadingNearby) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
          <Text style={styles.centerStateText}>
            {geocodingProgress || 'Đang xác định vị trí...'}
          </Text>
        </View>
      );
    }

    if (list.length === 0) {
      return (
        <View style={styles.centerState}>
          <Feather name="map-pin" size={48} color={LuxeColors.outlineVariant} />
          <Text style={styles.centerStateText}>Không có chi nhánh nào</Text>
        </View>
      );
    }

    return (
      <View style={styles.branchList}>
        {list.map((branch, idx) => {
          const isSelected = selectedBranch?.branchId === branch.branchId;
          const isNearest = idx === 0 && branch.distance != null;
          return (
            <BranchCard
              key={branch.branchId}
              branch={branch}
              isSelected={isSelected}
              onSelect={handleSelectBranch}
              distance={showDistances ? branch.distance : undefined}
              isNearest={isNearest}
            />
          );
        })}
      </View>
    );
  };

  const renderRecentList = () => {
    if (loadingRecent) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
          <Text style={styles.centerStateText}>Đang tải...</Text>
        </View>
      );
    }

    if (recentBranches.length === 0) {
      return (
        <View style={styles.centerState}>
          <Feather name="clock" size={48} color={LuxeColors.outlineVariant} />
          <Text style={styles.centerStateText}>Chưa có chi nhánh nào đã đặt gần đây</Text>
          <Text style={styles.centerStateSub}>
            Các chi nhánh bạn đặt sẽ xuất hiện ở đây
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.branchList}>
        {recentBranches.map((branch) => {
          const isSelected = selectedBranch?.branchId === branch.branchId;
          return (
            <BranchCard
              key={branch.branchId}
              branch={branch}
              isSelected={isSelected}
              onSelect={handleSelectBranch}
              showClock
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header title="Đặt lịch rửa xe" onBack={() => router.back()} />

        <ProgressSteps
          steps={[
            { label: 'Chi nhánh' },
            { label: 'Xe' },
            { label: 'Dịch vụ' },
            { label: 'Ngày' },
            { label: 'Xác nhận' },
          ]}
          currentStep={0}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={LuxeColors.primaryContainer}
            />
          }
        >
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Chọn chi nhánh</Text>
            <Text style={styles.welcomeSubtitle}>
              Chọn chi nhánh LuxeWash gần bạn để đặt lịch rửa xe
            </Text>
          </View>

          {/* Tab toggle */}
          <TabSegment active={activeTab} onChange={handleTabChange} />

          {/* Location permission banner */}
          {activeTab === 'nearby' && locationDenied && (
            <LocationBanner onOpenSettings={handleOpenSettings} />
          )}

          {/* Content */}
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
              <Text style={styles.centerStateText}>Đang tải danh sách chi nhánh...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <Feather name="alert-circle" size={48} color={LuxeColors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={async () => {
                  setLoading(true);
                  setError(null);
                  await loadBranches();
                  setLoading(false);
                }}
              >
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'nearby' ? (
            renderBranchList(branchesWithDistance, true)
          ) : (
            renderRecentList()
          )}

          {/* Selected Summary */}
          {selectedBranch && (
            <View style={styles.selectedSummary}>
              <View style={styles.selectedSummaryHeader}>
                <Feather
                  name="check-circle"
                  size={18}
                  color={LuxeColors.primaryContainer}
                />
                <Text style={styles.selectedSummaryTitle}>Chi nhánh đã chọn</Text>
              </View>
              <Text style={styles.selectedItem}>{selectedBranch.name}</Text>
              {selectedBranch.address && (
                <Text style={styles.selectedAddress}>{selectedBranch.address}</Text>
              )}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        <BottomActionBar
          title={
            selectedBranch ? 'TIẾP THEO' : 'CHỌN CHI NHÁNH ĐỂ TIẾP TỤC'
          }
          onPress={handleContinue}
          disabled={!selectedBranch}
          icon="arrow-right"
        />
      </SafeAreaView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  welcomeSection: { marginBottom: 16 },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: LuxeColors.onSurface,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Tab segment
  tabSegment: {
    flexDirection: 'row',
    backgroundColor: LuxeColors.surfaceContainer,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
  },
  tabBtnTextActive: {
    color: '#fff',
  },

  // Location banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer + '30',
    gap: 10,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
  },
  bannerBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bannerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // States
  centerState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  centerStateText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
  },
  centerStateSub: {
    fontSize: 12,
    color: LuxeColors.outline,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: LuxeColors.error,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Branch list
  branchList: { gap: 12 },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...LuxeShadows.sm,
  },
  branchCardSelected: {
    borderColor: LuxeColors.primaryContainer,
    backgroundColor: LuxeColors.primaryContainer + '08',
    ...LuxeShadows.md,
  },
  branchCardNearest: {
    borderColor: LuxeColors.primaryContainer + '40',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: LuxeColors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: LuxeColors.primaryContainer,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: LuxeColors.primaryContainer,
  },
  branchIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: LuxeColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  branchInfo: { flex: 1 },
  branchNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  branchNameSelected: {
    color: LuxeColors.primaryContainer,
  },
  nearestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  branchAddress: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LuxeColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Selected summary
  selectedSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    ...LuxeShadows.sm,
  },
  selectedSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  selectedItem: {
    fontSize: 15,
    fontWeight: '700',
    color: LuxeColors.primaryContainer,
    marginLeft: 4,
  },
  selectedAddress: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
    marginLeft: 4,
  },
});

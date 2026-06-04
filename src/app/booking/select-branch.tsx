/**
 * Advance Booking Flow - Step 0: Select Branch
 * Choose a branch before proceeding with vehicle/service/date selection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeShadows } from '@/constants/luxeTheme';
import { branchService, type BranchDTO } from '@/services/api';
import { Header } from '@/components/ui/Header';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { BottomActionBar } from '@/components/ui/BottomActionBar';

export default function SelectBranchScreen() {
  const router = useRouter();

  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBranches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await branchService.getBranches();
        if (res.statusCode === 200 && res.data) {
          setBranches(res.data);
        } else {
          setError('Không thể tải danh sách chi nhánh');
        }
      } catch (e) {
        setError('Không thể tải danh sách chi nhánh');
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, []);

  const handleSelectBranch = (branch: BranchDTO) => {
    setSelectedBranch(branch);
  };

  const handleContinue = () => {
    if (!selectedBranch) return;
    router.push({
      pathname: '/booking/select-vehicles',
      params: {
        branchId: String(selectedBranch.branchId),
        branchName: selectedBranch.name,
      },
    });
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
        >
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Chọn chi nhánh</Text>
            <Text style={styles.welcomeSubtitle}>
              Chọn chi nhánh LuxeWash gần bạn để đặt lịch rửa xe
            </Text>
          </View>

          {/* Branch List */}
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
              <Text style={styles.loadingText}>Đang tải danh sách chi nhánh...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Feather name="alert-circle" size={48} color={LuxeColors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  branchService.getBranches().then((res) => {
                    if (res.statusCode === 200 && res.data) {
                      setBranches(res.data);
                    } else {
                      setError('Không thể tải danh sách chi nhánh');
                    }
                    setLoading(false);
                  }).catch(() => {
                    setError('Không thể tải danh sách chi nhánh');
                    setLoading(false);
                  });
                }}
              >
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : branches.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="map-pin" size={48} color={LuxeColors.outlineVariant} />
              <Text style={styles.emptyText}>Không có chi nhánh nào</Text>
            </View>
          ) : (
            <View style={styles.branchList}>
              {branches.map((branch) => {
                const isSelected = selectedBranch?.branchId === branch.branchId;
                return (
                  <TouchableOpacity
                    key={branch.branchId}
                    style={[
                      styles.branchCard,
                      isSelected && styles.branchCardSelected,
                    ]}
                    onPress={() => handleSelectBranch(branch)}
                    activeOpacity={0.8}
                  >
                    {/* Radio indicator */}
                    <View
                      style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>

                    <View style={styles.branchIconWrap}>
                      <Feather
                        name="map-pin"
                        size={24}
                        color={
                          isSelected
                            ? LuxeColors.primaryContainer
                            : LuxeColors.onSurfaceVariant
                        }
                      />
                    </View>

                    <View style={styles.branchInfo}>
                      <Text
                        style={[
                          styles.branchName,
                          isSelected && styles.branchNameSelected,
                        ]}
                      >
                        {branch.name}
                      </Text>
                      {branch.address && (
                        <Text style={styles.branchAddress} numberOfLines={2}>
                          <Feather name="map" size={11} color={LuxeColors.onSurfaceVariant} />{' '}
                          {branch.address}
                        </Text>
                      )}
                    </View>

                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Feather name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxeColors.background },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  welcomeSection: { marginBottom: 24 },
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
  loadingState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  errorState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    ...LuxeShadows.sm,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: LuxeColors.onSurfaceVariant,
  },
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
  branchName: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  branchNameSelected: {
    color: LuxeColors.primaryContainer,
  },
  branchAddress: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 2,
  },
  branchPhone: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
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

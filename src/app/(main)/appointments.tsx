/**
 * Appointments Screen
 * Shows user's booking history and upcoming appointments with calendar view
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type MyBookingItem, type GetMyBookingsParams } from '@/services/api';
import {
  formatDate,
  formatTime,
  getGreeting,
  getDateKey,
  formatVnd,
} from '@/utils/format';

type TabType = 'all' | 'pending' | 'completed' | 'cancelled';

const statusMap: Record<string, string> = {
  Pending: 'pending',
  CheckedIn: 'pending',
  Processing: 'pending',
  Completed: 'completed',
  Cancelled: 'cancelled',
  CancelledBySystem: 'cancelled',
  NoShow: 'cancelled',
  Delayed: 'pending',
};

const STATUS_ACCENT: Record<string, string> = {
  completed: LuxeColors.primary,
  pending: LuxeColors.tertiary,
  cancelled: LuxeColors.outline,
};

const STATUS_LABEL: Record<string, string> = {
  completed: 'Hoàn thành',
  pending: 'Đang chờ',
  cancelled: 'Đã hủy',
};

const { width: SCREEN_W } = Dimensions.get('window');

const getStatusStyle = (mapped: string) => {
  switch (mapped) {
    case 'completed':
      return { bg: LuxeColors.primary + '12', text: LuxeColors.primary, dot: LuxeColors.primary };
    case 'pending':
      return { bg: LuxeColors.tertiary + '12', text: LuxeColors.tertiary, dot: LuxeColors.tertiary };
    case 'cancelled':
      return { bg: LuxeColors.surfaceContainer, text: LuxeColors.onSurfaceVariant, dot: LuxeColors.outline };
    default:
      return { bg: LuxeColors.surfaceContainer, text: LuxeColors.onSurfaceVariant, dot: LuxeColors.outline };
  }
};

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Date range filter
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Calendar selected date
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  const loadBookings = useCallback(async (params?: GetMyBookingsParams) => {
    try {
      const res = await bookingService.getMyBookings(params);
      if (res.statusCode === 200 && res.data) {
        setBookings(Array.isArray(res.data) ? res.data : []);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    }
  }, []);

  useEffect(() => {
    const doLoad = async () => {
      setLoading(true);
      await loadBookings();
      setLoading(false);
    };
    doLoad();
  }, [loadBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  // Build filter params
  const filterParams = useMemo((): GetMyBookingsParams => {
    const params: GetMyBookingsParams = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (activeTab !== 'all') {
      const tabStatuses: Record<string, string[]> = {
        pending: ['Pending', 'CheckedIn', 'Delayed'],
        completed: ['Completed'],
        cancelled: ['Cancelled', 'CancelledBySystem', 'NoShow'],
      };
      params.status = tabStatuses[activeTab]?.join(',');
    }
    return params;
  }, [startDate, endDate, activeTab]);

  const filteredBookings = useMemo(() => {
    let result = (bookings || []).filter((b) => {
      if (!b) return false;
      if (activeTab === 'all') return true;
      const mapped = statusMap[b.status] || b.status;
      if (activeTab === 'pending') return mapped === 'pending';
      if (activeTab === 'completed') return mapped === 'completed';
      if (activeTab === 'cancelled') return mapped === 'cancelled';
      return true;
    });

    // Calendar date filter
    if (viewMode === 'calendar' && selectedCalDate) {
      result = result.filter((b) => {
        if (!b.scheduledTime) return false;
        return getDateKey(b.scheduledTime) === selectedCalDate;
      });
    }

    // Sort by scheduledTime descending (nearest first)
    result.sort((a, b) => {
      const dateA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0;
      const dateB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [bookings, activeTab, viewMode, selectedCalDate]);

  // Build marked dates for calendar
  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string }> = {};
    bookings.forEach((b) => {
      if (!b.scheduledTime) return;
      const key = getDateKey(b.scheduledTime);
      const mapped = statusMap[b.status] || b.status;
      marks[key] = {
        marked: true,
        dotColor: STATUS_ACCENT[mapped] || LuxeColors.primary,
      };
    });
    if (selectedCalDate) {
      marks[selectedCalDate] = {
        ...(marks[selectedCalDate] || {}),
        selected: true,
        selectedColor: LuxeColors.primary,
        marked: marks[selectedCalDate]?.marked || false,
        dotColor: marks[selectedCalDate]?.dotColor || LuxeColors.primary,
      };
    }
    return marks;
  }, [bookings, selectedCalDate]);

  const handleCalendarDayPress = (day: DateData) => {
    setSelectedCalDate(day.dateString);
  };

  const handleApplyDateFilter = (date: DateData, isStart: boolean) => {
    if (isStart) {
      setStartDate(date.dateString);
      setShowStartPicker(false);
    } else {
      setEndDate(date.dateString);
      setShowEndPicker(false);
    }
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleBookNow = () => {
    router.push('/booking/select-vehicles');
  };

  const greeting = getGreeting();
  const now = new Date();
  const today = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const renderBookingCard = ({ item }: { item: MyBookingItem }) => {
    const mapped = statusMap[item.status] || item.status;
    const statusStyle = getStatusStyle(mapped);

    const date = item.scheduledTime ? formatDate(item.scheduledTime) : '';
    const time = item.scheduledTime ? formatTime(item.scheduledTime) : '';
    const vehiclePlate = item.licensePlate || '';
    const serviceName = item.serviceName || '';
    const userVehicle = user?.vehicles?.find((v) => v.licensePlate === vehiclePlate);
    const vehicleImage = userVehicle?.imageUrl;
    const accentColor = STATUS_ACCENT[mapped] || LuxeColors.primary;

    return (
      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.dateTimeRow}>
              <Feather name="calendar" size={13} color={LuxeColors.onSurfaceVariant} />
              <Text style={styles.cardDate}>{date}</Text>
              <Text style={styles.dateTimeSep}>•</Text>
              <Feather name="clock" size={13} color={LuxeColors.onSurfaceVariant} />
              <Text style={styles.cardTime}>{time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {STATUS_LABEL[mapped] || item.status}
              </Text>
            </View>
          </View>

          <View style={styles.vehicleRow}>
            {vehicleImage ? (
              <Image source={{ uri: vehicleImage }} style={styles.vehicleImage} />
            ) : (
              <View style={[styles.vehicleImage, styles.vehicleImagePlaceholder]}>
                <Feather name="truck" size={28} color={LuxeColors.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.vehicleInfo}>
              <Text style={styles.serviceName} numberOfLines={1}>{serviceName}</Text>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{vehiclePlate}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={LuxeColors.outlineVariant} />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.priceRow}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Giá gốc</Text>
              <Text style={styles.originalPrice}>
                {formatVnd(item.originalPrice || 0)}
              </Text>
              {(item.pointDiscountAmount > 0 || item.voucherDiscountAmount > 0) && (
                <>
                  {item.pointDiscountAmount > 0 && (
                    <Text style={styles.discountLine}>
                      Giảm điểm: -{formatVnd(item.pointDiscountAmount)}
                    </Text>
                  )}
                  {item.voucherDiscountAmount > 0 && (
                    <Text style={styles.discountLine}>
                      Giảm voucher: -{formatVnd(item.voucherDiscountAmount)}
                    </Text>
                  )}
                </>
              )}
            </View>
            <View style={styles.priceRight}>
              <Text style={styles.priceLabel}>Thành tiền</Text>
              <Text style={[
                styles.finalPrice,
                mapped === 'cancelled' && styles.finalPriceCancelled
              ]}>
                {formatVnd(item.finalAmount || 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Đang chờ' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  const ListHeader = () => (
    <View>
      {/* Greeting + Date */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.todayDate}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
        >
          <Feather
            name={viewMode === 'list' ? 'calendar' : 'list'}
            size={18}
            color={LuxeColors.primaryContainer}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <View style={[styles.tabIndicator, { backgroundColor: LuxeColors.primaryContainer }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Date range filter */}
      <View style={styles.dateFilterRow}>
        <TouchableOpacity
          style={[styles.dateChip, startDate && styles.dateChipActive]}
          onPress={() => setShowStartPicker(true)}
        >
          <Feather name="calendar" size={14} color={startDate ? LuxeColors.primaryContainer : LuxeColors.onSurfaceVariant} />
          <Text style={[styles.dateChipText, startDate && styles.dateChipTextActive]}>
            {startDate ? formatDate(startDate) : 'Từ ngày'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateSep}>—</Text>
        <TouchableOpacity
          style={[styles.dateChip, endDate && styles.dateChipActive]}
          onPress={() => setShowEndPicker(true)}
        >
          <Feather name="calendar" size={14} color={endDate ? LuxeColors.primaryContainer : LuxeColors.onSurfaceVariant} />
          <Text style={[styles.dateChipText, endDate && styles.dateChipTextActive]}>
            {endDate ? formatDate(endDate) : 'Đến ngày'}
          </Text>
        </TouchableOpacity>
        {(startDate || endDate) && (
          <TouchableOpacity onPress={clearDateFilter} style={styles.clearFilterBtn}>
            <Feather name="x" size={16} color={LuxeColors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleCalendarDayPress}
            markingType="dot"
            theme={{
              backgroundColor: LuxeColors.surface,
              calendarBackground: LuxeColors.surface,
              textSectionTitleColor: LuxeColors.onSurfaceVariant,
              selectedDayBackgroundColor: LuxeColors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: LuxeColors.primaryContainer,
              dayTextColor: LuxeColors.onSurface,
              textDisabledColor: LuxeColors.outlineVariant,
              dotColor: LuxeColors.primary,
              arrowColor: LuxeColors.primary,
              monthTextColor: LuxeColors.onSurface,
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 15,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
        </View>
      )}

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultCount}>
          {filteredBookings.length} lịch hẹn
          {activeTab !== 'all' && ` · ${tabs.find(t => t.key === activeTab)?.label}`}
          {selectedCalDate && viewMode === 'calendar' && ` · ${formatDate(selectedCalDate)}`}
        </Text>
      )}
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Feather name="calendar" size={40} color={LuxeColors.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
      <Text style={styles.emptySubtitle}>
        {viewMode === 'calendar' && selectedCalDate
          ? `Không có lịch hẹn vào ngày này`
          : 'Đặt lịch ngay để trải nghiệm dịch vụ rửa xe cao cấp'}
      </Text>
      <TouchableOpacity style={styles.emptyActionBtn} onPress={handleBookNow}>
        <Feather name="plus" size={18} color="#fff" />
        <Text style={styles.emptyActionBtnText}>Đặt lịch ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch hẹn</Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={LuxeColors.primaryContainer} />
            <Text style={styles.loadingText}>Đang tải lịch hẹn...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => String(item.bookingId || 'unknown')}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={LuxeColors.primaryContainer}
                colors={[LuxeColors.primaryContainer]}
              />
            }
          />
        )}
      </SafeAreaView>

      {/* Start Date Picker Modal */}
      <Modal visible={showStartPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowStartPicker(false)}>
          <View style={styles.pickerCard}>
            <Calendar
              current={startDate || undefined}
              onDayPress={(day) => handleApplyDateFilter(day, true)}
              markedDates={startDate ? { [startDate]: { selected: true, selectedColor: LuxeColors.primary } } : {}}
              markingType="simple"
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                selectedDayBackgroundColor: LuxeColors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: LuxeColors.primaryContainer,
                dayTextColor: LuxeColors.onSurface,
                textDisabledColor: LuxeColors.outlineVariant,
                arrowColor: LuxeColors.primary,
                monthTextColor: LuxeColors.onSurface,
                textDayFontSize: 14,
                textMonthFontSize: 15,
              }}
            />
          </View>
        </Pressable>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal visible={showEndPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowEndPicker(false)}>
          <View style={styles.pickerCard}>
            <Calendar
              current={endDate || undefined}
              onDayPress={(day) => handleApplyDateFilter(day, false)}
              markedDates={endDate ? { [endDate]: { selected: true, selectedColor: LuxeColors.primary } } : {}}
              markingType="simple"
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                selectedDayBackgroundColor: LuxeColors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: LuxeColors.primaryContainer,
                dayTextColor: LuxeColors.onSurface,
                textDisabledColor: LuxeColors.outlineVariant,
                arrowColor: LuxeColors.primary,
                monthTextColor: LuxeColors.onSurface,
                textDayFontSize: 14,
                textMonthFontSize: 15,
              }}
            />
          </View>
        </Pressable>
      </Modal>
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
  header: {
    paddingHorizontal: LuxeSpacing.lg,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '30',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LuxeColors.onSurface,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: LuxeSpacing.lg,
    paddingBottom: 100,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: LuxeSpacing.md,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
  },
  todayDate: {
    fontSize: 13,
    color: LuxeColors.outline,
    marginTop: 2,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LuxeColors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: LuxeSpacing.md,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: LuxeColors.surfaceContainer,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: LuxeColors.primaryContainer + '18',
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: LuxeColors.onSurfaceVariant,
  },
  tabTextActive: {
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: LuxeSpacing.md,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: LuxeColors.surfaceContainer,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  dateChipActive: {
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderColor: LuxeColors.primaryContainer,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: LuxeColors.onSurfaceVariant,
  },
  dateChipTextActive: {
    color: LuxeColors.primaryContainer,
  },
  dateSep: {
    color: LuxeColors.outlineVariant,
    fontSize: 14,
  },
  clearFilterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LuxeColors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.xl,
    overflow: 'hidden',
    marginBottom: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: LuxeColors.outlineVariant,
  },
  calendar: {
    borderRadius: LuxeBorderRadius.xl,
  },
  resultCount: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: LuxeSpacing.sm,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.xl,
    marginBottom: LuxeSpacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: {
    width: 4,
    borderTopLeftRadius: LuxeBorderRadius.xl,
    borderBottomLeftRadius: LuxeBorderRadius.xl,
  },
  cardBody: {
    flex: 1,
    padding: LuxeSpacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDate: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginLeft: 4,
  },
  cardTime: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    marginLeft: 2,
  },
  dateTimeSep: {
    fontSize: 12,
    color: LuxeColors.outlineVariant,
    marginHorizontal: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  vehicleImage: {
    width: 72,
    height: 72,
    borderRadius: LuxeBorderRadius.lg,
    backgroundColor: LuxeColors.surfaceVariant,
    flexShrink: 0,
  },
  vehicleImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: LuxeSpacing.md,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 6,
  },
  plateBadge: {
    backgroundColor: LuxeColors.primaryContainer + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  plateText: {
    fontSize: 13,
    fontWeight: '800',
    color: LuxeColors.primaryContainer,
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: LuxeColors.outlineVariant + '30',
    marginBottom: LuxeSpacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceInfo: {},
  priceLabel: {
    fontSize: 11,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: LuxeColors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  discountLine: {
    fontSize: 12,
    color: LuxeColors.primaryContainer,
    marginTop: 2,
    fontWeight: '500',
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.primary,
  },
  finalPriceCancelled: {
    color: LuxeColors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LuxeColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LuxeColors.onSurface,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: LuxeBorderRadius.md,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    backgroundColor: '#fff',
    borderRadius: LuxeBorderRadius.xl,
    overflow: 'hidden',
    width: SCREEN_W - 40,
    maxWidth: 400,
  },
});

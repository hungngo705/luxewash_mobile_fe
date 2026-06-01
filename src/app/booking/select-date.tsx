/**
 * Advance Booking Flow - Step 3: Select Date & Time
 * After selecting vehicles + service, user picks date and time slot
 * Uses POST /api/v1/bookings/available-slots to get available slots
 * Next: confirmation.tsx
 */

import React, { useState, useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type TimeSlot } from '@/services/api';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const toLocalDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toUTCMidnight = (date: Date): string => {
  const utc = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ));
  return utc.toISOString();
};

interface DayCell {
  date: Date | null;
  isPast: boolean;
  isLocked: boolean;
}

const PERIOD_LABEL: Record<string, string> = {
  morning: 'Sáng',
  afternoon: 'Chiều',
  evening: 'Tối',
};

export default function SelectDateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const serviceIdParam = parseInt(params.serviceId as string) || 0;
  const serviceNameParam = (params.serviceName as string) || '';
  const servicePriceParam = parseInt(params.servicePrice as string) || 0;
  const membershipDiscountParam = parseFloat(params.membershipDiscount as string) || 0;
  const vehicleIdsParam = (params.vehicleIds as string) || '';
  const vehicleTypeIdsParam = (params.vehicleTypeIds as string) || '';
  const vehicleBrandsParam = (params.vehicleBrands as string) || '';

  const vehiclePlateList = vehicleIdsParam ? vehicleIdsParam.split(',') : [];
  const vehicleTypeIdList = vehicleTypeIdsParam ? vehicleTypeIdsParam.split(',').map(Number) : [];
  const vehicleBrandList = vehicleBrandsParam ? vehicleBrandsParam.split('|') : [];

  const membershipInfo = user ? MembershipConfig[user.membershipTier] : MembershipConfig.standard;
  const maxAdvanceDays = membershipInfo.maxAdvanceDays;

  const getFirstOfMonth = (d: Date) => {
    const next = new Date(d);
    next.setDate(1);
    return next;
  };

  const [currentMonth, setCurrentMonth] = useState(getFirstOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const bookingVehicles = useMemo(() => {
    return vehiclePlateList.map((plate, i) => ({
      vehicleTypeId: vehicleTypeIdList[i] ?? 1,
      serviceId: serviceIdParam,
    }));
  }, [vehiclePlateList, vehicleTypeIdList, serviceIdParam]);

  const loadSlots = async (date: Date) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const isoDate = toUTCMidnight(date);
      const res = await bookingService.getAvailableSlots(isoDate, bookingVehicles);
      if (res.statusCode === 200 && res.data) {
        setSlots(res.data);
      } else {
        setSlots([]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể tải lịch trống';
      alert(msg);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const calendarDays = useMemo<DayCell[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: DayCell[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, isPast: false, isLocked: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isPast: date < today,
        isLocked: date >= today && date > maxDate,
      });
    }

    return days;
  }, [currentMonth, maxAdvanceDays]);

  const handleDateSelect = (day: DayCell) => {
    if (!day.date || day.isPast || day.isLocked) return;
    setSelectedDate(day.date);
    setSelectedSlot(null);
    loadSlots(day.date);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedSlot) return;
    router.push({
      pathname: '/booking/confirmation',
      params: {
        serviceId: String(serviceIdParam),
        serviceName: serviceNameParam,
        servicePrice: String(servicePriceParam),
        membershipDiscount: String(membershipDiscountParam),
        vehicleIds: vehicleIdsParam,
        vehicleTypeIds: vehicleTypeIdsParam,
        vehicleBrands: vehicleBrandsParam,
        date: toLocalDateString(selectedDate),
        slotId: String(selectedSlot.slotId),
        timeRange: selectedSlot.timeRange,
      },
    });
  };

  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = { morning: [], afternoon: [], evening: [] };
    for (const slot of slots) {
      const hour = parseInt((slot.timeRange || '00:00').split(':')[0], 10);
      if (hour < 12) groups.morning.push(slot);
      else if (hour < 17) groups.afternoon.push(slot);
      else groups.evening.push(slot);
    }
    return groups;
  }, [slots]);

  const monthYearDisplay = currentMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDateDisplay = selectedDate
    ? selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch rửa xe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={styles.progressLineCompleted} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="truck" size={16} color={LuxeColors.primaryContainer} />
            <Text style={styles.summaryText}>
              {vehiclePlateList.length} xe: {vehicleBrandList.join(', ')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="droplet" size={16} color={LuxeColors.primaryContainer} />
            <Text style={styles.summaryText}>{serviceNameParam}</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthYearDisplay}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.daysOfWeek}>
            {DAYS_OF_WEEK.map((day, index) => (
              <View key={index} style={styles.dayOfWeekCell}>
                <Text style={styles.dayOfWeekText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              if (!day.date) {
                return <View key={index} style={styles.dayCell} />;
              }

              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === day.date.toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day.isPast && styles.dayCellPast,
                    day.isLocked && styles.dayCellLocked,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => handleDateSelect(day)}
                  disabled={day.isPast || day.isLocked}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      day.isPast && styles.dayTextPast,
                      day.isLocked && styles.dayTextLocked,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                  {day.isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                  {isToday && !isSelected && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chọn giờ</Text>
              <Text style={styles.selectedDateLabel}>{selectedDateDisplay}</Text>
            </View>

            {loadingSlots ? (
              <View style={styles.loadingSlots}>
                <ActivityIndicator size="small" color={LuxeColors.primaryContainer} />
                <Text style={styles.loadingText}>Đang tải lịch trống...</Text>
              </View>
            ) : slots.length === 0 ? (
              <View style={styles.noSlotsCard}>
                <Feather name="calendar" size={40} color={LuxeColors.outlineVariant} />
                <Text style={styles.noSlotsText}>Không có lịch trống cho ngày này</Text>
                <Text style={styles.noSlotsSubtext}>Vui lòng chọn ngày khác</Text>
              </View>
            ) : (
              <>
                <View style={styles.slotsSummary}>
                  <Feather name="zap" size={16} color="#F59E0B" />
                  <Text style={styles.slotsSummaryText}>
                    {slots.filter(s => s.isAvailable).length} khung giờ trống
                  </Text>
                </View>

                {Object.entries(groupedSlots).map(([period, periodSlots]) =>
                  periodSlots.length > 0 ? (
                    <View key={period} style={styles.timePeriod}>
                      <Text style={styles.periodLabel}>{PERIOD_LABEL[period] || period}</Text>
                      <View style={styles.timeSlotsGrid}>
                        {periodSlots.map((slot) => {
                          const isSelected = selectedSlot?.slotId === slot.slotId;
                          return (
                            <TouchableOpacity
                              key={slot.slotId}
                              style={[
                                styles.timeSlot,
                                !slot.isAvailable && styles.timeSlotUnavailable,
                                isSelected && styles.timeSlotSelected,
                              ]}
                              onPress={() => slot.isAvailable && setSelectedSlot(slot)}
                              disabled={!slot.isAvailable}
                            >
                              <Text
                                style={[
                                  styles.timeSlotText,
                                  !slot.isAvailable && styles.timeSlotTextUnavailable,
                                  isSelected && styles.timeSlotTextSelected,
                                ]}
                              >
                                {slot.timeRange}
                              </Text>
                              {!slot.isAvailable && (
                                <Text style={styles.slotUnavailableText}>{slot.reason || 'Đã đầy'}</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : null,
                )}
              </>
            )}
          </View>
        )}

        {/* Membership info */}
        <View style={styles.membershipCard}>
          <Feather name="star" size={24} color={LuxeColors.primaryContainer} />
          <View style={styles.membershipContent}>
            <Text style={styles.membershipTitle}>Đặc quyền {membershipInfo.nameVi}</Text>
            <Text style={styles.membershipDesc}>
              Đặt trước tối đa {maxAdvanceDays} ngày
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.continueBtn, (!selectedDate || !selectedSlot) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedSlot}
          activeOpacity={0.9}
        >
          <Text style={styles.continueBtnText}>TIẾP THEO</Text>
          <Text style={styles.continueBtnIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxeColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: LuxeColors.outlineVariant + '20',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: LuxeColors.onSurface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    alignItems: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: LuxeColors.primaryContainer,
    borderWidth: 2,
    borderColor: LuxeColors.primary,
  },
  progressDotCompleted: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  progressDotPending: {
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLineCompleted: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.md,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    marginTop: LuxeSpacing.sm,
    marginBottom: LuxeSpacing.md,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 13,
    color: LuxeColors.onSurface,
    fontWeight: '500',
  },
  section: {
    marginBottom: LuxeSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.md,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
    marginBottom: LuxeSpacing.md,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LuxeSpacing.md,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 24,
    color: LuxeColors.onSurface,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: LuxeSpacing.xs,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LuxeBorderRadius.md,
    marginBottom: 4,
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayCellLocked: {
    opacity: 0.5,
  },
  dayCellToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: LuxeColors.outline,
  },
  dayCellSelected: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  dayNumber: {
    fontSize: 15,
    color: LuxeColors.onSurface,
  },
  dayTextPast: {
    color: LuxeColors.onSurfaceVariant,
  },
  dayTextLocked: {
    color: LuxeColors.onSurfaceVariant,
  },
  dayTextSelected: {
    color: LuxeColors.onPrimaryContainer,
    fontWeight: '700',
  },
  dayTextToday: {
    color: LuxeColors.primaryContainer,
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 9,
    position: 'absolute',
    bottom: 4,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: LuxeColors.primary,
    position: 'absolute',
    bottom: 6,
  },
  loadingSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: LuxeSpacing.lg,
    gap: LuxeSpacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  noSlotsCard: {
    alignItems: 'center',
    padding: LuxeSpacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: LuxeBorderRadius.lg,
    gap: 8,
  },
  noSlotsText: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  noSlotsSubtext: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },
  slotsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LuxeColors.primaryContainer + '10',
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.sm,
    borderRadius: LuxeBorderRadius.md,
    gap: 8,
    marginBottom: LuxeSpacing.md,
  },
  slotsSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: LuxeColors.primaryContainer,
  },
  timePeriod: {
    marginBottom: LuxeSpacing.md,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxeColors.onSurfaceVariant,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  timeSlotUnavailable: {
    backgroundColor: LuxeColors.surfaceVariant,
    opacity: 0.5,
  },
  timeSlotSelected: {
    backgroundColor: LuxeColors.primaryContainer,
    borderColor: LuxeColors.primaryContainer,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  timeSlotTextUnavailable: {
    color: LuxeColors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  timeSlotTextSelected: {
    color: LuxeColors.onPrimaryContainer,
  },
  slotUnavailableText: {
    fontSize: 10,
    color: LuxeColors.onSurfaceVariant,
    marginTop: 2,
  },
  membershipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    gap: LuxeSpacing.md,
  },
  membershipContent: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 2,
  },
  membershipDesc: {
    fontSize: 13,
    color: LuxeColors.onSurfaceVariant,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: LuxeColors.outlineVariant + '20',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LuxeColors.primaryContainer,
    paddingVertical: 16,
    borderRadius: LuxeBorderRadius.lg,
  },
  continueBtnDisabled: {
    backgroundColor: LuxeColors.surfaceVariant,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  continueBtnIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
});

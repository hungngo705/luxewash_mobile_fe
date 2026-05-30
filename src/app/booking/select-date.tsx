/**
 * Advance Booking Flow - Step 2: Select Date & Time
 * Calendar with time slot selection based on membership tier
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LuxeColors, LuxeSpacing, LuxeBorderRadius, MembershipConfig } from '@/constants/luxeTheme';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type TimeSlot } from '@/services/api';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

interface DayCell {
  date: Date | null;
  isPast: boolean;
  isLocked: boolean;
}

export default function SelectDateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;

  const membershipInfo = user ? MembershipConfig[user.membershipTier] : MembershipConfig.standard;
  const maxAdvanceDays = membershipInfo.maxAdvanceDays;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const res = await bookingService.getSlots(date);
      if (res.statusCode === 200 && res.data) {
        setSlots(res.data);
      }
    } catch (e) {
      console.error('Failed to load slots:', e);
    }
    setLoadingSlots(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
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
    if (day.date && !day.isPast && !day.isLocked) {
      setSelectedDate(day.date);
      setSelectedTimeSlot(null);
      loadSlots(day.date.toISOString().split('T')[0]);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      router.push({
        pathname: '/booking/select-service',
        params: {
          vehicleId: vehicleId || '',
          date: selectedDate.toISOString(),
          timeSlotId: String(selectedTimeSlot.slotId),
          timeRange: selectedTimeSlot.timeRange,
        },
      });
    }
  };

  const vehicleName = user?.vehicles.find(v => v.id === vehicleId);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = { morning: [], afternoon: [], evening: [] };
    for (const slot of slots) {
      const hour = parseInt(slot.timeRange.split(':')[0], 10);
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

  const periodLabel: Record<string, string> = {
    morning: 'Sáng',
    afternoon: 'Chiều',
    evening: 'Tối',
  };

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
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotPending]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Selected Vehicle */}
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>
            {vehicleName ? `${vehicleName.brand} ${vehicleName.model}` : ''}
          </Text>
          <Text style={styles.vehiclePlate}>{vehicleName?.licensePlate || ''}</Text>
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthYearDisplay}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Days of Week Header */}
          <View style={styles.daysOfWeek}>
            {DAYS_OF_WEEK.map((day, index) => (
              <View key={index} style={styles.dayOfWeekCell}>
                <Text style={styles.dayOfWeekText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
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
                  {isToday && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slots Section */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khung giờ đến</Text>
              {loadingSlots ? (
                <Text style={styles.availableText}>Đang tải...</Text>
              ) : (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableIcon}>⚡</Text>
                  <Text style={styles.availableText}>
                    {slots.filter(s => s.isAvailable).length} khung giờ
                  </Text>
                </View>
              )}
            </View>

            {Object.entries(groupedSlots).map(([period, periodSlots]) =>
              periodSlots.length > 0 ? (
                <View key={period} style={styles.timePeriod}>
                  <Text style={styles.periodLabel}>{periodLabel[period] || period}</Text>
                  <View style={styles.timeSlotsGrid}>
                    {periodSlots.map((slot) => {
                      const isSelected = selectedTimeSlot?.slotId === slot.slotId;
                      return (
                        <TouchableOpacity
                          key={slot.slotId}
                          style={[
                            styles.timeSlot,
                            !slot.isAvailable && styles.timeSlotUnavailable,
                            isSelected && styles.timeSlotSelected,
                          ]}
                          onPress={() => slot.isAvailable && setSelectedTimeSlot(slot)}
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
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null,
            )}

            <View style={styles.infoBadge}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Khung giờ có thể đầy. Vui lòng chọn thời gian khác nếu không có giờ trống.
              </Text>
            </View>
          </View>
        )}

        {/* Membership Info Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipIcon}>
            <Text style={styles.membershipIconText}>🏆</Text>
          </View>
          <View style={styles.membershipContent}>
            <Text style={styles.membershipTitle}>Đặc quyền {membershipInfo.nameVi}</Text>
            <Text style={styles.membershipDesc}>
              Đặt trước tối đa {maxAdvanceDays} ngày.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (!selectedDate || !selectedTimeSlot) && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTimeSlot}
        >
          <Text style={styles.continueBtnText}>ĐẶT LỊCH</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: LuxeColors.onSurfaceVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: LuxeSpacing.md,
    paddingVertical: LuxeSpacing.md,
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
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  progressDotPending: {
    backgroundColor: LuxeColors.surfaceVariant,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: LuxeColors.primaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LuxeSpacing.md,
    paddingBottom: 100,
  },
  vehicleInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: LuxeBorderRadius.lg,
    padding: LuxeSpacing.sm,
    marginBottom: LuxeSpacing.md,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    textAlign: 'center',
  },
  vehiclePlate: {
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    textAlign: 'center',
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
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navBtnText: {
    fontSize: 24,
    color: LuxeColors.onSurface,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: LuxeSpacing.sm,
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
    backgroundColor: LuxeColors.surfaceContainer,
    opacity: 0.4,
  },
  dayCellLocked: {
    backgroundColor: LuxeColors.surfaceContainerHighest,
    opacity: 0.6,
  },
  dayCellToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: LuxeColors.outline,
  },
  dayCellSelected: {
    backgroundColor: LuxeColors.primaryContainer,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 5,
  },
  dayNumber: {
    fontSize: 16,
    color: LuxeColors.onSurface,
  },
  dayTextPast: {
    color: LuxeColors.onSurfaceVariant,
    opacity: 0.4,
  },
  dayTextLocked: {
    color: LuxeColors.onSurfaceVariant,
    opacity: 0.6,
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
    fontSize: 10,
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
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  availableIcon: {
    fontSize: 12,
  },
  availableText: {
    fontSize: 12,
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
    opacity: 0.6,
    marginBottom: 8,
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
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeSlotUnavailable: {
    backgroundColor: LuxeColors.surfaceVariant,
    opacity: 0.5,
  },
  timeSlotSelected: {
    backgroundColor: LuxeColors.primaryContainer,
    borderColor: LuxeColors.primaryContainer,
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxeColors.onSurface,
  },
  timeSlotTextUnavailable: {
    color: LuxeColors.onSurfaceVariant,
  },
  timeSlotTextSelected: {
    color: LuxeColors.onPrimaryContainer,
  },
  infoBadge: {
    flexDirection: 'row',
    backgroundColor: LuxeColors.primaryContainer + '10',
    borderRadius: LuxeBorderRadius.md,
    padding: LuxeSpacing.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: LuxeColors.primaryContainer + '30',
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: LuxeColors.onSurfaceVariant,
    lineHeight: 18,
  },
  membershipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.md,
    gap: LuxeSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  membershipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LuxeColors.primaryContainer + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipIconText: {
    fontSize: 20,
  },
  membershipContent: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LuxeColors.onSurface,
    marginBottom: 4,
  },
  membershipDesc: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LuxeSpacing.md,
    backgroundColor: 'rgba(247, 249, 251, 0.9)',
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
    shadowColor: LuxeColors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  continueBtnDisabled: {
    backgroundColor: LuxeColors.surfaceVariant,
    shadowOpacity: 0,
    elevation: 0,
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

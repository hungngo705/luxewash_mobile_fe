/**
 * Shared formatting utilities for LuxeWash app
 */

export const VND_PER_POINT = 10000;

export const vndToPoints = (vnd: number): number => {
  return Math.floor(vnd / VND_PER_POINT);
};

export const pointsToVnd = (points: number): number => {
  return points * VND_PER_POINT;
};

export const formatVnd = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatVndShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return amount.toLocaleString('vi-VN');
};

export const formatPoints = (vnd: number): string => {
  const pts = vndToPoints(vnd);
  return pts.toLocaleString('vi-VN');
};

export const formatPointsWithVnd = (vnd: number): string => {
  const pts = vndToPoints(vnd);
  return `${pts.toLocaleString('vi-VN')} điểm (≈ ${formatVnd(vnd)})`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

export const formatTime = (isoDateStr: string): string => {
  if (!isoDateStr) return '';
  const date = new Date(isoDateStr);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (isoDateStr: string): string => {
  if (!isoDateStr) return '';
  return `${formatDate(isoDateStr)} lúc ${formatTime(isoDateStr)}`;
};

export const toIsoDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buổi sáng tốt lành';
  if (hour < 18) return 'Buổi chiều tốt lành';
  return 'Buổi tối tốt lành';
};

export const getDateKey = (isoDateStr: string): string => {
  return isoDateStr.split('T')[0];
};

/**
 * Core pure time calculation utilities for Heating & Paint Curing (温时 · 烘烤计时)
 * Supports arbitrary dayOffsets (calendar dates or Yesterday/Today/Tomorrow)
 */

export type DayOffset = number; // 0 = Today, -1 = Yesterday, 1 = Tomorrow, or any day delta from Today

export interface TimePoint {
  dayOffset: DayOffset;
  hour: number;   // 0 - 23
  minute: number; // 0 - 59
}

export interface DurationValue {
  hours: number;
  minutes: number;
}

export interface DurationResult {
  isValid: boolean;
  errorMessage?: string;
  totalMinutes: number;
  hours: number;
  minutes: number;
  decimalHours: string; // e.g., "13" or "13.5"
  formattedDuration: string; // e.g., "13小时" or "13小时 30分钟"
  hmLabel: string; // e.g., "13时0分" or "9时24分" matching sketch "X时X分"
  paperSlipText: string;
  crossDays: number;
  periodDescription: string;
}

export interface TargetTimeResult {
  targetPoint: TimePoint;
  formattedTime24: string;
  formattedTime12: string;
  dayLabel: string;
  periodLabel: string;
  fullLabel: string;
  paperSlipText: string;
  totalDurationText: string;
}

export const DAY_OFFSET_LABELS: Record<number, string> = {
  [-2]: '前天',
  [-1]: '昨天',
  [0]: '今天',
  [1]: '明天',
  [2]: '后天',
};

export function padZero(num: number): string {
  return String(Math.floor(Math.abs(num))).padStart(2, '0');
}

export function formatHHMM(hour: number, minute: number): string {
  return `${padZero(hour)}:${padZero(minute)}`;
}

/**
 * Convert a dayOffset relative to Today into a YYYY-MM-DD string for <input type="date">
 */
export function dayOffsetToDateString(dayOffset: number, baseDate: Date = new Date()): string {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() + dayOffset);
  const yyyy = d.getFullYear();
  const mm = padZero(d.getMonth() + 1);
  const dd = padZero(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convert a YYYY-MM-DD string into a dayOffset relative to Today
 */
export function dateStringToDayOffset(dateStr: string, baseDate: Date = new Date()): number {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / 86400000);
}

/**
 * Format dayOffset as a concise Chinese label (e.g., "昨天", "今天", "明天", or "10月28日")
 */
export function getDayOffsetDisplayLabel(dayOffset: number, baseDate: Date = new Date()): string {
  if (dayOffset in DAY_OFFSET_LABELS) {
    return DAY_OFFSET_LABELS[dayOffset];
  }
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() + dayOffset);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const WEEKDAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * Format dayOffset as explicit calendar date (e.g., "2026年10月24日 周六")
 */
export function formatExplicitDateWithWeekday(dayOffset: number, baseDate: Date = new Date()): string {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() + dayOffset);
  const yyyy = d.getFullYear();
  const mm = padZero(d.getMonth() + 1);
  const dd = padZero(d.getDate());
  const wk = WEEKDAYS_ZH[d.getDay()];
  return `${yyyy}-${mm}-${dd} (${wk})`;
}

/**
 * Get human-friendly Chinese period of day (凌晨, 早上, 上午, 中午, 下午, 晚上)
 */
export function getChinesePeriodOfDay(hour: number): string {
  if (hour >= 0 && hour < 6) return '凌晨';
  if (hour >= 6 && hour <= 9) return '早上';
  if (hour >= 10 && hour < 12) return '上午';
  if (hour >= 12 && hour < 14) return '中午';
  if (hour >= 14 && hour < 18) return '下午';
  return '晚上';
}

/**
 * Combines DayOffset + period of day naturally (e.g. "昨晚", "今早", "今天上午", "明天下午")
 */
export function getNaturalDayPeriodLabel(dayOffset: DayOffset, hour: number): string {
  const period = getChinesePeriodOfDay(hour);
  if (dayOffset === -1 && period === '晚上') return '昨晚';
  if (dayOffset === -1 && period === '早上') return '昨早';
  if (dayOffset === 0 && period === '早上') return '今早';
  if (dayOffset === 0 && period === '晚上') return '今晚';
  if (dayOffset === 1 && period === '早上') return '明早';
  if (dayOffset === 1 && period === '晚上') return '明晚';
  const dayName = getDayOffsetDisplayLabel(dayOffset);
  return `${dayName}${period}`;
}

export function formatTimePointNatural(point: TimePoint): string {
  const naturalPrefix = getNaturalDayPeriodLabel(point.dayOffset, point.hour);
  return `${naturalPrefix} ${formatHHMM(point.hour, point.minute)}`;
}

/**
 * Convert TimePoint to total minutes relative to Today 00:00
 */
export function timePointToMinutes(point: TimePoint): number {
  return point.dayOffset * 1440 + point.hour * 60 + point.minute;
}

/**
 * Convert total minutes relative to Today 00:00 back into a TimePoint
 */
export function minutesToTimePoint(totalMinutes: number): {
  point: TimePoint;
  rawDayOffset: number;
} {
  const rawDayOffset = Math.floor(totalMinutes / 1440);
  let remainder = totalMinutes % 1440;
  if (remainder < 0) {
    remainder += 1440;
  }
  const hour = Math.floor(remainder / 60);
  const minute = remainder % 60;

  return {
    point: {
      dayOffset: rawDayOffset,
      hour,
      minute,
    },
    rawDayOffset,
  };
}

export function formatDurationText(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return '0小时';
  if (minutes === 0) return `${hours}小时`;
  if (hours === 0) return `${minutes}分钟`;
  return `${hours}小时 ${minutes}分钟`;
}

export function formatHMText(hours: number, minutes: number): string {
  return `${hours}时${minutes}分`;
}

export function formatDecimalHours(totalMinutes: number): string {
  const dec = totalMinutes / 60;
  if (Number.isInteger(dec)) {
    return dec.toString();
  }
  return Number(dec.toFixed(2)).toString();
}

/**
 * Mode 1: Calculate duration between start TimePoint and end TimePoint
 */
export function calculateTimeDifference(start: TimePoint, end: TimePoint): DurationResult {
  const startTotal = timePointToMinutes(start);
  const endTotal = timePointToMinutes(end);
  const diff = endTotal - startTotal;

  if (diff < 0) {
    return {
      isValid: false,
      errorMessage: '结束时间早于开始时间',
      totalMinutes: 0,
      hours: 0,
      minutes: 0,
      decimalHours: '0',
      formattedDuration: '0小时',
      hmLabel: '0时0分',
      paperSlipText: '',
      crossDays: 0,
      periodDescription: `${formatTimePointNatural(start)} → ${formatTimePointNatural(end)}`,
    };
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  const decimalHours = formatDecimalHours(diff);
  const formattedDuration = formatDurationText(hours, minutes);
  const hmLabel = formatHMText(hours, minutes);
  const crossDays = end.dayOffset - start.dayOffset;
  const periodDescription = `${formatTimePointNatural(start)} → ${formatTimePointNatural(end)}`;
  const paperSlipText = `起：${formatTimePointNatural(start)} ｜ 止：${formatTimePointNatural(end)} ｜ 共计：${formattedDuration}（${decimalHours}h）`;

  return {
    isValid: true,
    totalMinutes: diff,
    hours,
    minutes,
    decimalHours,
    formattedDuration,
    hmLabel,
    paperSlipText,
    crossDays: Math.max(0, crossDays),
    periodDescription,
  };
}

/**
 * Mode 2: Forward calculation (顺推几点结束)
 */
export function calculateForwardEndTime(start: TimePoint, duration: DurationValue): TargetTimeResult {
  const startMins = timePointToMinutes(start);
  const addMins = Math.round(Math.max(0, duration.hours * 60 + duration.minutes));
  const targetMins = startMins + addMins;

  const { point } = minutesToTimePoint(targetMins);
  const dayLabel = getDayOffsetDisplayLabel(point.dayOffset);
  const periodLabel = getChinesePeriodOfDay(point.hour);
  const formattedTime24 = formatHHMM(point.hour, point.minute);

  const hour12 = point.hour % 12 === 0 ? 12 : point.hour % 12;
  const formattedTime12 = `${periodLabel} ${padZero(hour12)}:${padZero(point.minute)}`;
  const totalDurationText = formatDurationText(duration.hours, duration.minutes);
  const decimalH = formatDecimalHours(addMins);
  const fullLabel = `${getNaturalDayPeriodLabel(point.dayOffset, point.hour)} ${formattedTime24}`;

  const paperSlipText = `起：${formatTimePointNatural(start)} ｜ 止：${fullLabel} ｜ 加温：${totalDurationText}（${decimalH}h）`;

  return {
    targetPoint: point,
    formattedTime24,
    formattedTime12,
    dayLabel,
    periodLabel,
    fullLabel,
    paperSlipText,
    totalDurationText,
  };
}

/**
 * Mode 3: Backward calculation (倒推几点开始)
 */
export function calculateBackwardStartTime(end: TimePoint, duration: DurationValue): TargetTimeResult {
  const endMins = timePointToMinutes(end);
  const subMins = Math.round(Math.max(0, duration.hours * 60 + duration.minutes));
  const targetMins = endMins - subMins;

  const { point } = minutesToTimePoint(targetMins);
  const dayLabel = getDayOffsetDisplayLabel(point.dayOffset);
  const periodLabel = getChinesePeriodOfDay(point.hour);
  const formattedTime24 = formatHHMM(point.hour, point.minute);

  const hour12 = point.hour % 12 === 0 ? 12 : point.hour % 12;
  const formattedTime12 = `${periodLabel} ${padZero(hour12)}:${padZero(point.minute)}`;
  const totalDurationText = formatDurationText(duration.hours, duration.minutes);
  const decimalH = formatDecimalHours(subMins);
  const fullLabel = `${getNaturalDayPeriodLabel(point.dayOffset, point.hour)} ${formattedTime24}`;

  const paperSlipText = `起：${fullLabel} ｜ 止：${formatTimePointNatural(end)} ｜ 加温：${totalDurationText}（${decimalH}h）`;

  return {
    targetPoint: point,
    formattedTime24,
    formattedTime12,
    dayLabel,
    periodLabel,
    fullLabel,
    paperSlipText,
    totalDurationText,
  };
}

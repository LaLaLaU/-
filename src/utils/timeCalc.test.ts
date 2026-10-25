import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTimeDifference,
  calculateForwardEndTime,
  calculateBackwardStartTime,
  formatDecimalHours,
  getNaturalDayPeriodLabel,
} from './timeCalc';

test('User Example 1: Yesterday evening 8:30 (20:30) to Today morning 9:30 (09:30) equals 13 hours', () => {
  const result = calculateTimeDifference(
    { dayOffset: -1, hour: 20, minute: 30 },
    { dayOffset: 0, hour: 9, minute: 30 }
  );

  assert.equal(result.isValid, true);
  assert.equal(result.hours, 13);
  assert.equal(result.minutes, 0);
  assert.equal(result.totalMinutes, 780);
  assert.equal(result.decimalHours, '13');
  assert.equal(result.formattedDuration, '13小时');
  assert.equal(result.periodDescription, '昨晚 20:30 → 今早 09:30');
});

test('Time difference with half hours: Yesterday 21:15 to Today 08:45 equals 11 hours 30 minutes (11.5h)', () => {
  const result = calculateTimeDifference(
    { dayOffset: -1, hour: 21, minute: 15 },
    { dayOffset: 0, hour: 8, minute: 45 }
  );

  assert.equal(result.isValid, true);
  assert.equal(result.hours, 11);
  assert.equal(result.minutes, 30);
  assert.equal(result.decimalHours, '11.5');
  assert.equal(result.formattedDuration, '11小时 30分钟');
});

test('Invalid time difference when end is earlier than start returns isValid=false', () => {
  const result = calculateTimeDifference(
    { dayOffset: 0, hour: 20, minute: 30 },
    { dayOffset: 0, hour: 9, minute: 30 }
  );

  assert.equal(result.isValid, false);
  assert.ok(result.errorMessage);
});

test('User Example 2: Forward calculation - Start at Today 20:30 + 18 hours heating -> Tomorrow 14:30', () => {
  const result = calculateForwardEndTime(
    { dayOffset: 0, hour: 20, minute: 30 },
    { hours: 18, minutes: 0 }
  );

  assert.equal(result.targetPoint.dayOffset, 1);
  assert.equal(result.targetPoint.hour, 14);
  assert.equal(result.targetPoint.minute, 30);
  assert.equal(result.formattedTime24, '14:30');
  assert.equal(result.dayLabel, '明天');
  assert.equal(result.periodLabel, '下午');
  assert.equal(result.fullLabel, '明天下午 14:30');
});

test('User Example 3: Backward calculation - End at Today 09:30 - 19 hours heating -> Yesterday 14:30', () => {
  const result = calculateBackwardStartTime(
    { dayOffset: 0, hour: 9, minute: 30 },
    { hours: 19, minutes: 0 }
  );

  assert.equal(result.targetPoint.dayOffset, -1);
  assert.equal(result.targetPoint.hour, 14);
  assert.equal(result.targetPoint.minute, 30);
  assert.equal(result.formattedTime24, '14:30');
  assert.equal(result.dayLabel, '昨天');
  assert.equal(result.periodLabel, '下午');
  assert.equal(result.fullLabel, '昨天下午 14:30');
});

test('Decimal hours and natural labels formatting', () => {
  assert.equal(formatDecimalHours(780), '13');
  assert.equal(formatDecimalHours(810), '13.5');
  assert.equal(formatDecimalHours(795), '13.25');
  assert.equal(getNaturalDayPeriodLabel(-1, 20), '昨晚');
  assert.equal(getNaturalDayPeriodLabel(0, 8), '今早');
});

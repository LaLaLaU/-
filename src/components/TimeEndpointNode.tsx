import React, { useState } from 'react';
import {
  TimePoint,
  padZero,
  getDayOffsetDisplayLabel,
  formatExplicitDateWithWeekday,
} from '../utils/timeCalc';
import { Calendar, Clock, Lock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeEndpointNodeProps {
  title: string;
  value: TimePoint;
  editable: boolean;
  revealed: boolean;
  hasConfirmed: boolean;
  lockedHintText?: string;
  onChange: (next: TimePoint) => void;
  accent?: 'orange' | 'dark';
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_QUICK = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const WEEKDAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

export const TimeEndpointNode: React.FC<TimeEndpointNodeProps> = ({
  title,
  value,
  editable,
  revealed,
  hasConfirmed,
  lockedHintText = '待前两项选择后生成',
  onChange,
  accent = 'orange',
}) => {
  const [openBox, setOpenBox] = useState<'hour' | 'minute' | 'calendar' | null>(null);

  // Calendar view state (year, month 0-11)
  const today = new Date();
  const selectedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + value.dayOffset
  );
  const [calYear, setCalYear] = useState(selectedDate.getFullYear());
  const [calMonth, setCalMonth] = useState(selectedDate.getMonth());

  const handleToggleCalendar = () => {
    if (!editable) return;
    if (openBox === 'calendar') {
      setOpenBox(null);
    } else {
      const target = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + value.dayOffset
      );
      setCalYear(target.getFullYear());
      setCalMonth(target.getMonth());
      setOpenBox('calendar');
    }
  };

  const handleSelectHour = (h: number) => {
    if (!editable) return;
    onChange({ ...value, hour: h });
    setOpenBox(null);
  };

  const handleSelectMinute = (m: number) => {
    if (!editable) return;
    onChange({ ...value, minute: m });
    setOpenBox(null);
  };

  const handleSelectDay = (dayOffset: number) => {
    if (!editable) return;
    onChange({ ...value, dayOffset });
    if (openBox === 'calendar') {
      setOpenBox(null);
    }
  };

  const handleSelectCalendarDate = (year: number, month: number, day: number) => {
    if (!editable) return;
    const baseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const chosen = new Date(year, month, day);
    const diffDays = Math.round((chosen.getTime() - baseToday.getTime()) / 86400000);
    onChange({ ...value, dayOffset: diffDays });
    setOpenBox(null);
  };

  const handleSetNow = () => {
    if (!editable) return;
    const now = new Date();
    onChange({
      dayOffset: 0,
      hour: now.getHours(),
      minute: now.getMinutes(),
    });
    setOpenBox(null);
  };

  const stepMonth = (delta: number) => {
    const d = new Date(calYear, calMonth + delta, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  };

  // Build calendar days for calYear / calMonth
  const firstDayWeek = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: firstDayWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isCustomCalendarDay =
    value.dayOffset !== -1 && value.dayOffset !== 0 && value.dayOffset !== 1;
  const explicitDateText = formatExplicitDateWithWeekday(value.dayOffset);

  // When not revealed yet (Waiting for the other two elements to be chosen)
  if (!revealed) {
    return (
      <div
        data-testid={`endpoint-${title}-locked`}
        className="rounded-3xl bg-white/60 border border-dashed border-black/15 p-4 sm:p-5 flex flex-col items-center justify-center min-h-[245px] text-center select-none transition-all"
      >
        <div className="text-xs font-semibold text-[#6E6E73] mb-3">{title}</div>

        {/* Two Mystery / Locked Digit Boxes matching sketch */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="w-[74px] h-[74px] sm:w-20 sm:h-20 rounded-2xl bg-[#E8E8ED]/80 border border-black/[0.06] flex items-center justify-center font-mono-tabular text-3xl sm:text-4xl font-bold text-[#98989D]">
            <span>--</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-[#98989D] font-mono-tabular">
            :
          </span>
          <div className="w-[74px] h-[74px] sm:w-20 sm:h-20 rounded-2xl bg-[#E8E8ED]/80 border border-black/[0.06] flex items-center justify-center font-mono-tabular text-3xl sm:text-4xl font-bold text-[#98989D]">
            <span>--</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6E6E73] bg-[#F5F5F7] px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
          <span>{lockedHintText}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`endpoint-${title}`}
      className={`rounded-3xl p-4 sm:p-5 transition-all flex flex-col items-center justify-between relative ${
        editable
          ? 'bg-white border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
          : 'bg-[#FFF9F5] border-2 border-[#FF6B00]/40 shadow-[0_4px_20px_rgba(255,107,0,0.06)]'
      }`}
    >
      {/* Top Status & Quick "Now" Button */}
      <div className="w-full flex items-center justify-between gap-2 mb-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs sm:text-sm font-semibold ${
              editable ? 'text-[#1D1D1F]' : 'text-[#FF6B00]'
            }`}
          >
            {title}
          </span>
          {editable && hasConfirmed && (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1D7A4C]" aria-label="已设定" />
          )}
          {!editable && (
            <span className="text-[11px] text-[#6E6E73]">· 计算结果</span>
          )}
        </div>

        {editable ? (
          <button
            type="button"
            onClick={handleSetNow}
            className="min-h-[30px] px-2.5 py-1 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F] flex items-center gap-1 transition-colors cursor-pointer"
            aria-label={`将${title}设为现在`}
          >
            <Clock className="w-3 h-3 text-[#FF6B00]" />
            <span>现在</span>
          </button>
        ) : (
          <span className="text-xs font-semibold text-[#FF6B00] font-mono-tabular">
            {getDayOffsetDisplayLabel(value.dayOffset)}
          </span>
        )}
      </div>

      {/* Two Large Square Boxes [ XX ] : [ XX ] */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 my-0.5">
        {/* Hour Box */}
        <button
          type="button"
          disabled={!editable}
          onClick={() => setOpenBox(openBox === 'hour' ? null : 'hour')}
          aria-label={`${title}小时 ${padZero(value.hour)}时`}
          className={`w-[74px] h-[74px] sm:w-20 sm:h-20 rounded-2xl font-mono-tabular text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all relative ${
            !editable
              ? 'bg-white text-[#FF6B00] border border-[#FF6B00]/30 shadow-xs cursor-default'
              : openBox === 'hour'
              ? 'bg-[#FFF3EB] text-[#FF6B00] border-2 border-[#FF6B00] shadow-sm cursor-pointer'
              : accent === 'orange'
              ? 'bg-[#F5F5F7] hover:bg-[#EFEFF4] text-[#1D1D1F] border border-black/[0.08] cursor-pointer active:scale-[0.97]'
              : 'bg-[#F5F5F7] hover:bg-[#EFEFF4] text-[#1D1D1F] border border-black/[0.08] cursor-pointer active:scale-[0.97]'
          }`}
        >
          <span>{padZero(value.hour)}</span>
        </button>

        <span
          className={`text-2xl sm:text-3xl font-bold font-mono-tabular ${
            editable ? 'text-[#1D1D1F]' : 'text-[#FF6B00]'
          }`}
        >
          :
        </span>

        {/* Minute Box */}
        <button
          type="button"
          disabled={!editable}
          onClick={() => setOpenBox(openBox === 'minute' ? null : 'minute')}
          aria-label={`${title}分钟 ${padZero(value.minute)}分`}
          className={`w-[74px] h-[74px] sm:w-20 sm:h-20 rounded-2xl font-mono-tabular text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all relative ${
            !editable
              ? 'bg-white text-[#FF6B00] border border-[#FF6B00]/30 shadow-xs cursor-default'
              : openBox === 'minute'
              ? 'bg-[#FFF3EB] text-[#FF6B00] border-2 border-[#FF6B00] shadow-sm cursor-pointer'
              : 'bg-[#F5F5F7] hover:bg-[#EFEFF4] text-[#1D1D1F] border border-black/[0.08] cursor-pointer active:scale-[0.97]'
          }`}
        >
          <span>{padZero(value.minute)}</span>
        </button>
      </div>

      {/* Expandable Overlay when clicking Hour Box */}
      {editable && openBox === 'hour' && (
        <div
          role="dialog"
          aria-label={`${title}点选小时`}
          className="absolute inset-0 z-20 rounded-3xl bg-white/95 backdrop-blur-md p-4 flex flex-col justify-between border border-[#FF6B00]/30 shadow-xl animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D1D1F]">{title} · 选择小时 (0–23时)</span>
            <button
              type="button"
              onClick={() => setOpenBox(null)}
              className="px-2.5 py-0.5 rounded-lg bg-[#FFF3EB] text-xs text-[#FF6B00] font-semibold cursor-pointer"
            >
              关闭
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5 my-auto py-1">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleSelectHour(h)}
                className={`min-h-[34px] rounded-xl font-mono-tabular text-xs font-semibold transition-colors cursor-pointer ${
                  value.hour === h
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              >
                {padZero(h)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Overlay when clicking Minute Box */}
      {editable && openBox === 'minute' && (
        <div
          role="dialog"
          aria-label={`${title}点选分钟`}
          className="absolute inset-0 z-20 rounded-3xl bg-white/95 backdrop-blur-md p-4 flex flex-col justify-between border border-[#FF6B00]/30 shadow-xl animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D1D1F]">{title} · 选择分钟</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onChange({ ...value, minute: (value.minute + 59) % 60 })
                }
                className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] text-xs font-mono-tabular text-[#1D1D1F] hover:bg-[#E8E8ED] cursor-pointer"
              >
                -1分
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...value, minute: (value.minute + 1) % 60 })
                }
                className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] text-xs font-mono-tabular text-[#1D1D1F] hover:bg-[#E8E8ED] cursor-pointer"
              >
                +1分
              </button>
              <button
                type="button"
                onClick={() => setOpenBox(null)}
                className="ml-1 px-2.5 py-0.5 rounded-lg bg-[#FFF3EB] text-xs text-[#FF6B00] font-semibold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 my-auto py-1">
            {MINUTES_QUICK.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleSelectMinute(m)}
                className={`min-h-[38px] rounded-xl font-mono-tabular text-xs font-semibold transition-colors cursor-pointer ${
                  value.minute === m
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              >
                :{padZero(m)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explicit Date Text placed between Hour:Minute boxes and 昨天/今天/明天 */}
      <div
        data-testid={`endpoint-${title}-date`}
        className="text-xs font-mono-tabular font-medium text-[#6E6E73] mt-2"
      >
        {explicitDateText}
      </div>

      {/* Sketch Core Element 2: 昨天 / 今天 / 明天 Segmented Row */}
      <div className="w-full mt-2">
        <div
          className={`grid grid-cols-3 gap-1 p-1 rounded-2xl ${
            editable ? 'bg-[#F5F5F7]' : 'bg-[#F0EBE6]'
          }`}
          role="group"
          aria-label={`${title} 昨今明切换`}
        >
          {[
            { offset: -1, short: '昨', full: '昨天' },
            { offset: 0, short: '今', full: '今天' },
            { offset: 1, short: '明', full: '明天' },
          ].map((item) => {
            const active = value.dayOffset === item.offset;
            return (
              <button
                key={item.offset}
                type="button"
                disabled={!editable}
                onClick={() => handleSelectDay(item.offset)}
                className={`min-h-[36px] rounded-xl text-sm font-semibold transition-all ${
                  !editable
                    ? active
                      ? 'bg-[#FF6B00] text-white shadow-xs cursor-default'
                      : 'text-[#8E8E93] cursor-default'
                    : active
                    ? 'bg-white text-[#1D1D1F] shadow-sm cursor-pointer'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer'
                }`}
                aria-pressed={active}
              >
                {item.full}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive [ 日历 ] Button (Only shown on editable nodes, hidden on calculated result nodes) */}
      {editable && (
        <div className="w-full mt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={handleToggleCalendar}
            aria-label={`${title}打开日历选择日期`}
            aria-expanded={openBox === 'calendar'}
            className={`min-h-[34px] px-4 py-1 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 border transition-colors ${
              openBox === 'calendar' || isCustomCalendarDay
                ? 'border-[#FF6B00] bg-[#FFF3EB] text-[#FF6B00] font-semibold cursor-pointer'
                : 'border-black/[0.08] bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] cursor-pointer'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>日历</span>
          </button>
        </div>
      )}

      {/* Requirement 2: Built-in Apple-Style Interactive Calendar Picker Overlay */}
      {editable && openBox === 'calendar' && (
        <div
          role="dialog"
          aria-label={`${title}日历选择器`}
          className="absolute inset-0 z-20 rounded-3xl bg-white/98 backdrop-blur-md p-3.5 flex flex-col justify-between border border-[#FF6B00]/30 shadow-xl animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepMonth(-1)}
                className="w-6 h-6 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] hover:bg-[#E8E8ED] cursor-pointer"
                aria-label="上个月"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono-tabular text-[#1D1D1F] px-1">
                {calYear}年 {calMonth + 1}月
              </span>
              <button
                type="button"
                onClick={() => stepMonth(1)}
                className="w-6 h-6 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] hover:bg-[#E8E8ED] cursor-pointer"
                aria-label="下个月"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpenBox(null)}
              className="px-2 py-0.5 rounded-lg bg-[#FFF3EB] text-xs text-[#FF6B00] font-semibold cursor-pointer"
            >
              关闭
            </button>
          </div>

          <div className="my-auto">
            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-[#6E6E73] mb-1">
              {WEEKDAY_HEADERS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`empty-${idx}`} className="h-6" />;
                }
                const isSelected =
                  calYear === selectedDate.getFullYear() &&
                  calMonth === selectedDate.getMonth() &&
                  dayNum === selectedDate.getDate();
                const isToday =
                  calYear === today.getFullYear() &&
                  calMonth === today.getMonth() &&
                  dayNum === today.getDate();

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectCalendarDate(calYear, calMonth, dayNum)}
                    className={`h-6 rounded-md font-mono-tabular text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : isToday
                        ? 'bg-[#FFF3EB] text-[#FF6B00] border border-[#FF6B00]/40'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

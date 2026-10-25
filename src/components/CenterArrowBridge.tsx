import React, { useState, useRef, useEffect } from 'react';
import {
  DurationValue,
  DurationResult,
  formatDecimalHours,
  formatHMText,
} from '../utils/timeCalc';
import { Minus, Plus, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface CenterArrowBridgeProps {
  mode: 'diff' | 'forward' | 'backward';
  diffResult: DurationResult;
  duration: DurationValue;
  hasConfirmedDuration: boolean;
  onChangeDuration: (next: DurationValue) => void;
}

// Page 1: 8h to 24h; Page 2: >24h
const HOURS_PAGES: number[][] = [
  [8, 12, 15, 16, 18, 19, 20, 24],
  [26, 28, 30, 32, 36, 40, 44, 48],
];

// Minute options without '+' prefix
const QUICK_MINUTES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const CenterArrowBridge: React.FC<CenterArrowBridgeProps> = ({
  mode,
  diffResult,
  duration,
  hasConfirmedDuration,
  onChangeDuration,
}) => {
  const [hourPage, setHourPage] = useState<number>(duration.hours > 24 ? 1 : 0);
  const swipeStartX = useRef<number | null>(null);

  // Sync page automatically when hours cross the 24h boundary via +/- buttons
  useEffect(() => {
    if (duration.hours > 24 && hourPage === 0) {
      setHourPage(1);
    } else if (duration.hours <= 24 && hourPage === 1 && HOURS_PAGES[0].includes(duration.hours)) {
      setHourPage(0);
    }
  }, [duration.hours]);

  // Mode 1: Read-only calculated interval above and below the arrow
  if (mode === 'diff') {
    return (
      <div
        data-testid="center-arrow-diff"
        className="flex flex-col items-center justify-center px-2 py-4 select-none"
      >
        {diffResult.isValid ? (
          <>
            {/* Above the arrow: X.X 小时 */}
            <div
              data-testid="hero-primary-result"
              className="text-3xl sm:text-4xl font-bold font-mono-tabular text-[#FF6B00] tracking-tight text-center whitespace-nowrap"
            >
              {diffResult.decimalHours} 小时
            </div>

            {/* Horizontal Long Arrow matching sketch */}
            <div className="w-full max-w-[230px] my-3 flex items-center">
              <div className="h-[2.5px] flex-1 bg-[#1D1D1F] rounded-full" />
              <svg
                className="w-5 h-5 text-[#1D1D1F] -ml-2 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>

            {/* Below the arrow: X时X分 */}
            <div className="text-xl sm:text-2xl font-bold font-mono-tabular text-[#1D1D1F] tracking-tight text-center whitespace-nowrap">
              {diffResult.hmLabel}
            </div>
          </>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FFF3EB] border border-[#FF6B00]/30 text-center max-w-[220px]">
            <AlertCircle className="w-5 h-5 text-[#FF6B00] mx-auto mb-1" />
            <div className="text-xs font-semibold text-[#1D1D1F]">
              结束早于开始时间
            </div>
            <div className="text-[11px] text-[#6E6E73] mt-0.5">
              请检查左/右侧的日期
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode 2 (forward) & Mode 3 (backward): Editable duration above and below the arrow
  const totalMins = duration.hours * 60 + duration.minutes;
  const decimalHoursStr = formatDecimalHours(totalMins);
  const hmStr = formatHMText(duration.hours, duration.minutes);

  const adjustHours = (delta: number) => {
    const nextH = Math.max(0, Math.min(120, duration.hours + delta));
    onChangeDuration({ ...duration, hours: nextH });
  };

  // Independent Hour selection: preserves currently selected minutes!
  const handleSelectHour = (h: number) => {
    onChangeDuration({ ...duration, hours: h });
  };

  // Independent Minute selection: preserves currently selected hours!
  const handleToggleMinute = (m: number) => {
    const nextMin = duration.minutes === m ? 0 : m;
    onChangeDuration({ ...duration, minutes: nextMin });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - swipeStartX.current;
    if (deltaX < -30 && hourPage < HOURS_PAGES.length - 1) {
      setHourPage(hourPage + 1);
    } else if (deltaX > 30 && hourPage > 0) {
      setHourPage(hourPage - 1);
    }
    swipeStartX.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const deltaX = e.clientX - swipeStartX.current;
    if (deltaX < -35 && hourPage < HOURS_PAGES.length - 1) {
      setHourPage(hourPage + 1);
    } else if (deltaX > 35 && hourPage > 0) {
      setHourPage(hourPage - 1);
    }
    swipeStartX.current = null;
  };

  return (
    <div
      data-testid="center-arrow-editable"
      className="flex flex-col items-center justify-center px-1 py-0.5"
    >
      {/* Top hint badge */}
      <div className="flex items-center gap-1 text-[11px] font-medium text-[#6E6E73] mb-1">
        <span>加温时长</span>
        {hasConfirmedDuration && (
          <CheckCircle2 className="w-3 h-3 text-[#1D7A4C]" aria-label="时长已确认" />
        )}
      </div>

      {/* Above the arrow: Single-line Interactive [ - ] [ X.X 小时 ] [ + ] */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => adjustHours(-1)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-black/[0.08] shadow-xs hover:bg-[#E8E8ED] active:scale-95 flex items-center justify-center text-[#1D1D1F] cursor-pointer shrink-0"
          aria-label="减少1小时"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div
          className="px-3.5 py-1 rounded-2xl bg-white border-2 border-[#FF6B00] shadow-xs text-lg sm:text-xl font-bold font-mono-tabular text-[#FF6B00] whitespace-nowrap shrink-0 select-none"
          aria-label="当前加温小时数"
        >
          {decimalHoursStr} 小时
        </div>

        <button
          type="button"
          onClick={() => adjustHours(1)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-black/[0.08] shadow-xs hover:bg-[#E8E8ED] active:scale-95 flex items-center justify-center text-[#1D1D1F] cursor-pointer shrink-0"
          aria-label="增加1小时"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Long Arrow: points left (<---) toward 开始时间 in backward mode, right (--->) in forward mode */}
      <div
        data-testid={`center-arrow-line-${mode === 'backward' ? 'left' : 'right'}`}
        className="w-full max-w-[230px] my-1.5 flex items-center"
      >
        {mode === 'backward' ? (
          <>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-[#1D1D1F] -mr-2 shrink-0 z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <div className="h-[2.5px] flex-1 bg-[#1D1D1F] rounded-full" />
          </>
        ) : (
          <>
            <div className="h-[2.5px] flex-1 bg-[#1D1D1F] rounded-full" />
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-[#1D1D1F] -ml-2 shrink-0 z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </>
        )}
      </div>

      {/* Below the arrow: X时X分 */}
      <div className="text-sm sm:text-base font-bold font-mono-tabular text-[#1D1D1F] whitespace-nowrap select-none">
        {hmStr}
      </div>

      {/* Compact Quick Hours (Swipeable Page 1: 8-24h / Page 2: >24h) & Independent Minutes Grid */}
      <div className="mt-1.5 w-full max-w-[260px] bg-white rounded-2xl p-2 border border-black/[0.07] shadow-xs select-none">
        {/* Swipeable Hours Area */}
        <div
          data-testid="hours-swipe-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="touch-pan-y"
        >
          <div className="grid grid-cols-4 gap-1">
            {HOURS_PAGES[hourPage].map((h) => {
              // Selected state depends ONLY on duration.hours === h so hours & minutes highlight simultaneously
              const active = duration.hours === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleSelectHour(h)}
                  className={`min-h-[27px] rounded-lg font-mono-tabular text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF6B00] text-white shadow-xs'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                  }`}
                >
                  {h}h
                </button>
              );
            })}
          </div>

          {/* Subtle Page Indicator & Switcher for Page 1 (8-24h) and Page 2 (24h+) */}
          <div className="flex items-center justify-between mt-1 px-0.5">
            <button
              type="button"
              onClick={() => setHourPage(0)}
              aria-label="第一页 8至24小时"
              className={`text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                hourPage === 0
                  ? 'text-[#FF6B00] bg-[#FFF3EB] font-semibold'
                  : 'text-[#8E8E93] hover:text-[#1D1D1F]'
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              <span>8-24h</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHourPage(0)}
                aria-label="切换到第一页"
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  hourPage === 0 ? 'w-4 bg-[#FF6B00]' : 'w-1.5 bg-[#D1D1D6]'
                }`}
              />
              <button
                type="button"
                onClick={() => setHourPage(1)}
                aria-label="切换到第二页(24小时以上)"
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  hourPage === 1 ? 'w-4 bg-[#FF6B00]' : 'w-1.5 bg-[#D1D1D6]'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setHourPage(1)}
              aria-label="第二页 24小时以上"
              className={`text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                hourPage === 1
                  ? 'text-[#FF6B00] bg-[#FFF3EB] font-semibold'
                  : 'text-[#8E8E93] hover:text-[#1D1D1F]'
              }`}
            >
              <span>24h+</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Minutes Grid: '+' removed, independent selection highlighted simultaneously with hours */}
        <div className="grid grid-cols-4 gap-1 mt-1 pt-1 border-t border-black/[0.06]">
          {QUICK_MINUTES.map((m) => {
            const active = duration.minutes === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleToggleMinute(m)}
                className={`min-h-[24px] px-1 rounded-lg font-mono-tabular text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {m}分
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

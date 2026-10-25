import React, { useState } from 'react';
import {
  DurationValue,
  DurationResult,
  formatDecimalHours,
  formatHMText,
} from '../utils/timeCalc';
import { Minus, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CenterArrowBridgeProps {
  mode: 'diff' | 'forward' | 'backward';
  diffResult: DurationResult;
  duration: DurationValue;
  hasConfirmedDuration: boolean;
  onChangeDuration: (next: DurationValue) => void;
}

const QUICK_HOURS = [8, 12, 15, 16, 18, 19, 20, 24];
// Requirement 4: Remove "整点", provide more minute choices (+5分 to +55分)
const QUICK_MINUTES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const CenterArrowBridge: React.FC<CenterArrowBridgeProps> = ({
  mode,
  diffResult,
  duration,
  hasConfirmedDuration,
  onChangeDuration,
}) => {
  const [showPicker, setShowPicker] = useState(false);

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

  const handleToggleMinute = (m: number) => {
    // Clicking an already active minute resets minutes to 0, or sets to m
    const nextMin = duration.minutes === m ? 0 : m;
    onChangeDuration({ ...duration, minutes: nextMin });
  };

  return (
    <div
      data-testid="center-arrow-editable"
      className="flex flex-col items-center justify-center px-1 py-1"
    >
      {/* Top hint badge */}
      <div className="flex items-center gap-1 text-xs font-medium text-[#6E6E73] mb-1.5">
        <span>加温时长</span>
        {hasConfirmedDuration && (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D7A4C]" aria-label="时长已确认" />
        )}
      </div>

      {/* Above the arrow: Single-line Interactive [ - ] [ X.X 小时 ] [ + ] */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => adjustHours(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-black/[0.08] shadow-xs hover:bg-[#E8E8ED] active:scale-95 flex items-center justify-center text-[#1D1D1F] cursor-pointer shrink-0"
          aria-label="减少1小时"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="px-4 py-1.5 rounded-2xl bg-white border-2 border-[#FF6B00] shadow-xs text-xl sm:text-2xl font-bold font-mono-tabular text-[#FF6B00] cursor-pointer hover:bg-[#FFF3EB] transition-colors whitespace-nowrap shrink-0"
          aria-label="点选加温小时数"
        >
          {decimalHoursStr} 小时
        </button>

        <button
          type="button"
          onClick={() => adjustHours(1)}
          className="w-9 h-9 rounded-xl bg-white border border-black/[0.08] shadow-xs hover:bg-[#E8E8ED] active:scale-95 flex items-center justify-center text-[#1D1D1F] cursor-pointer shrink-0"
          aria-label="增加1小时"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Long Arrow: points left (<---) toward 开始时间 in backward mode, right (--->) in forward mode */}
      <div
        data-testid={`center-arrow-line-${mode === 'backward' ? 'left' : 'right'}`}
        className="w-full max-w-[230px] my-2 flex items-center"
      >
        {mode === 'backward' ? (
          <>
            <svg
              className="w-5 h-5 text-[#1D1D1F] -mr-2 shrink-0 z-10"
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
              className="w-5 h-5 text-[#1D1D1F] -ml-2 shrink-0 z-10"
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
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="text-base sm:text-lg font-bold font-mono-tabular text-[#1D1D1F] hover:text-[#FF6B00] transition-colors cursor-pointer whitespace-nowrap"
      >
        {hmStr}
      </button>

      {/* Compact Quick Hours & Expanded Minutes Grid right under the arrow */}
      <div className="mt-2 w-full max-w-[260px] bg-white rounded-2xl p-2.5 border border-black/[0.07] shadow-xs">
        <div className="grid grid-cols-4 gap-1">
          {QUICK_HOURS.map((h) => {
            const active = duration.hours === h && duration.minutes === 0;
            return (
              <button
                key={h}
                type="button"
                onClick={() => onChangeDuration({ hours: h, minutes: 0 })}
                className={`min-h-[30px] rounded-lg font-mono-tabular text-xs font-semibold transition-all cursor-pointer ${
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

        {/* Requirement 4: Removed "整点", added rich minute choices (+5分 to +55分) */}
        <div className="grid grid-cols-6 gap-1 mt-1.5 pt-1.5 border-t border-black/[0.06]">
          {QUICK_MINUTES.map((m) => {
            const active = duration.minutes === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleToggleMinute(m)}
                className={`min-h-[26px] rounded-lg font-mono-tabular text-[10px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                +{m}分
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

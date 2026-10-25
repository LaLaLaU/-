/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TimePoint,
  DurationValue,
  calculateTimeDifference,
  calculateForwardEndTime,
  calculateBackwardStartTime,
} from './utils/timeCalc';
import { TimeEndpointNode } from './components/TimeEndpointNode';
import { CenterArrowBridge } from './components/CenterArrowBridge';
import { PWAInstallModal } from './components/PWAInstallModal';
import { Timer, ArrowRight, History, Smartphone } from 'lucide-react';

type CalcMode = 'diff' | 'forward' | 'backward';

function getCurrentTimePoint(): TimePoint {
  const now = new Date();
  return {
    dayOffset: 0,
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
}

export default function App() {
  const [activeMode, setActiveMode] = useState<CalcMode>('diff');

  // Left Time Point (Default: Current real time on open)
  const [leftPoint, setLeftPoint] = useState<TimePoint>(() => getCurrentTimePoint());

  // Right Time Point (Default: Current real time on open)
  const [rightPoint, setRightPoint] = useState<TimePoint>(() => getCurrentTimePoint());

  // Center Duration (Default: 18 hours)
  const [duration, setDuration] = useState<DurationValue>({
    hours: 18,
    minutes: 0,
  });

  const handleSwitchMode = (nextMode: CalcMode) => {
    setActiveMode(nextMode);
    if (nextMode === 'forward') {
      setLeftPoint(getCurrentTimePoint());
    } else if (nextMode === 'backward') {
      setRightPoint(getCurrentTimePoint());
      setDuration({ hours: 19, minutes: 0 });
    }
  };

  // Computed Results
  const diffResult = useMemo(
    () => calculateTimeDifference(leftPoint, rightPoint),
    [leftPoint, rightPoint]
  );

  const forwardResult = useMemo(
    () => calculateForwardEndTime(leftPoint, duration),
    [leftPoint, duration]
  );

  const backwardResult = useMemo(
    () => calculateBackwardStartTime(rightPoint, duration),
    [rightPoint, duration]
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col sm:flex-row">
      {/* Left Vertical Navigation Sidebar */}
      <aside className="bg-[#F5F5F7]/95 backdrop-blur-md border-b sm:border-b-0 sm:border-r border-black/[0.07] px-3 py-2.5 sm:w-[132px] sm:py-4 sm:px-2.5 flex sm:flex-col items-center sm:items-stretch justify-between gap-2 shrink-0">
        <a
          href="#top"
          className="text-sm sm:text-base font-bold tracking-tight text-[#1D1D1F] sm:px-2 sm:pt-1 whitespace-nowrap shrink-0 text-center"
        >
          加温计时
        </a>

        {/* Vertical Mode Switcher Navigation on Left */}
        <nav
          aria-label="计算模式切换"
          className="bg-[#E8E8ED] p-1 rounded-2xl flex sm:flex-col gap-1.5 w-full"
        >
          <button
            type="button"
            onClick={() => handleSwitchMode('diff')}
            className={`min-h-[38px] sm:min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
              activeMode === 'diff'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
            aria-pressed={activeMode === 'diff'}
          >
            <Timer className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
            <span>时差</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('forward')}
            className={`min-h-[38px] sm:min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
              activeMode === 'forward'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
            aria-pressed={activeMode === 'forward'}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
            <span>顺推</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('backward')}
            className={`min-h-[38px] sm:min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
              activeMode === 'backward'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
            aria-pressed={activeMode === 'backward'}
          >
            <History className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
            <span>倒推</span>
          </button>
        </nav>

        <div className="flex items-center justify-center shrink-0">
          <PWAInstallModal />
        </div>
      </aside>

      {/* Main Horizontal 3-Column Stage (Designed for Phone Landscape & Desktop) */}
      <main
        id="top"
        className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 flex flex-col justify-center"
      >
        {/* Subtle Portrait Rotation Suggestion Banner (Visible only on narrow portrait screens < 500px) */}
        <div className="sm:hidden mb-3 px-3 py-1.5 rounded-xl bg-white/80 border border-black/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-[#6E6E73]">
          <Smartphone className="w-3.5 h-3.5 text-[#FF6B00] rotate-90 shrink-0" />
          <span>横屏握持手机，即可体验左 · 中 · 右同屏全景调节</span>
        </div>

        {/* 3-Column Horizontal Sketch Architecture:
            [ Left Time Node ]  ----( X.X小时 / X时X分 )---->  [ Right Time Node ] */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-3.5 items-center">
          {/* LEFT NODE: Start Time */}
          <div className="sm:col-span-4">
            {activeMode === 'diff' && (
              <TimeEndpointNode
                title="开始时间"
                value={leftPoint}
                editable={true}
                revealed={true}
                hasConfirmed={false}
                onChange={setLeftPoint}
                accent="orange"
              />
            )}

            {activeMode === 'forward' && (
              <TimeEndpointNode
                title="开始时间"
                value={leftPoint}
                editable={true}
                revealed={true}
                hasConfirmed={false}
                onChange={setLeftPoint}
                accent="orange"
              />
            )}

            {activeMode === 'backward' && (
              <TimeEndpointNode
                title="开始时间"
                value={backwardResult.targetPoint}
                editable={false}
                revealed={true}
                hasConfirmed={false}
                onChange={() => {}}
              />
            )}
          </div>

          {/* CENTER BRIDGE: Arrow with X.X小时 above and X时X分 below */}
          <div className="sm:col-span-4">
            <CenterArrowBridge
              mode={activeMode}
              diffResult={diffResult}
              duration={duration}
              hasConfirmedDuration={false}
              onChangeDuration={setDuration}
            />
          </div>

          {/* RIGHT NODE: End Time */}
          <div className="sm:col-span-4">
            {activeMode === 'diff' && (
              <TimeEndpointNode
                title="结束时间"
                value={rightPoint}
                editable={true}
                revealed={true}
                hasConfirmed={false}
                onChange={setRightPoint}
                accent="dark"
              />
            )}

            {activeMode === 'forward' && (
              <TimeEndpointNode
                title="结束时间"
                value={forwardResult.targetPoint}
                editable={false}
                revealed={true}
                hasConfirmed={false}
                onChange={() => {}}
              />
            )}

            {activeMode === 'backward' && (
              <TimeEndpointNode
                title="结束时间"
                value={rightPoint}
                editable={true}
                revealed={true}
                hasConfirmed={false}
                onChange={setRightPoint}
                accent="orange"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

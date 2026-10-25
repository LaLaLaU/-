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

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#F5F5F7] text-[#1D1D1F] flex flex-row select-none">
      {/* Ultra-Narrow Left Vertical Navigation Sidebar */}
      <aside className="bg-[#F5F5F7]/95 backdrop-blur-md border-r border-black/[0.07] w-[66px] sm:w-[72px] py-2.5 px-1.5 flex flex-col items-center justify-between gap-1.5 shrink-0 h-full">
        <button
          type="button"
          onClick={handleToggleFullscreen}
          title="点击切换全屏"
          className="text-[12px] font-bold tracking-tight text-[#1D1D1F] leading-tight text-center py-1 cursor-pointer hover:text-[#FF6B00] transition-colors"
        >
          加温计时
        </button>

        {/* Ultra-Compact Vertical Mode Switcher Navigation on Left */}
        <nav
          aria-label="计算模式切换"
          className="bg-[#E8E8ED] p-1 rounded-2xl flex flex-col gap-1.5 w-full"
        >
          <button
            type="button"
            onClick={() => handleSwitchMode('diff')}
            className={`min-h-[44px] px-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap w-full ${
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
            className={`min-h-[44px] px-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap w-full ${
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
            className={`min-h-[44px] px-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap w-full ${
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

        <div className="w-full flex items-center justify-center shrink-0">
          <PWAInstallModal />
        </div>
      </aside>

      {/* Main Horizontal 3-Column Stage (Adaptive Full-Screen Fit, No Vertical Scroll) */}
      <main
        id="top"
        className="flex-1 h-full overflow-hidden px-2.5 sm:px-4 py-2 flex items-center justify-center"
      >
        {/* 3-Column Horizontal Sketch Architecture:
            [ Left Time Node ]  ----( X.X小时 / X时X分 )---->  [ Right Time Node ] */}
        <div className="grid grid-cols-12 gap-2.5 sm:gap-4 items-center w-full max-w-5xl">
          {/* LEFT NODE: Start Time */}
          <div className="col-span-4">
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
          <div className="col-span-4">
            <CenterArrowBridge
              mode={activeMode}
              diffResult={diffResult}
              duration={duration}
              hasConfirmedDuration={false}
              onChangeDuration={setDuration}
            />
          </div>

          {/* RIGHT NODE: End Time */}
          <div className="col-span-4">
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

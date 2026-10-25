import React, { useState } from 'react';
import { Smartphone, X, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        className="w-full min-h-[34px] px-1.5 py-1.5 rounded-xl bg-[#1D1D1F] text-white text-[11px] font-medium flex items-center justify-center gap-1 hover:bg-[#1D1D1F]/90 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
        aria-label="安装到手机桌面"
      >
        <Download className="w-3 h-3 text-[#FF6B00] shrink-0" />
        <span>装桌面</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-modal-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/[0.06] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] flex items-center justify-center text-[#FF6B00]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="pwa-modal-title" className="text-base font-semibold text-[#1D1D1F]">
                    安装「加温计时」到手机桌面
                  </h3>
                  <p className="text-xs text-[#6E6E73]">
                    像原生安卓/苹果 App 一样全屏秒开、离线可用
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#6E6E73] hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                aria-label="关闭安装指南"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#1D1D1F]">
              {isIOS ? (
                <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2">
                  <p className="font-semibold text-xs text-[#6E6E73]">iPhone / iPad 安装步骤：</p>
                  <p>1. 点击浏览器底部工具栏的 <strong>分享</strong> 按钮</p>
                  <p>2. 向下滑动菜单，点击 <strong>添加到主屏幕</strong></p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2.5">
                  <p className="font-semibold text-xs text-[#6E6E73]">安卓手机安装步骤（Chrome / Edge / 系统浏览器）：</p>
                  <p>1. 点击浏览器右上角或底部的 <strong>菜单按钮（⋮ 或 三横线）</strong></p>
                  <p>2. 选择 <strong>添加到主屏幕</strong> 或 <strong>安装应用</strong></p>
                  <p className="text-xs text-[#6E6E73] pt-1">
                    安装后即可在手机桌面生成独立图标，车间无网络也能随时算时间。
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#1D7A4C] pt-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>支持离线计算 · 跨天时差与顺推倒推秒算</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-[#1D1D1F]/90 active:scale-[0.99] transition-all cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};

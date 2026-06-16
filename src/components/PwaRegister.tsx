"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/**
 * 서비스워커 등록 + 홈화면 설치 프롬프트.
 * - SW 등록으로 PWA 설치 가능 + 푸시 수신 기반 확보
 * - beforeinstallprompt 캡처 → "홈 화면에 추가" 배너 노출 (Android/Chrome)
 */
export function PwaRegister() {
  const [deferred, setDeferred] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || dismissed) return null;

  async function install() {
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* noop */
    }
    setDeferred(null);
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[55] w-[calc(100%-32px)] max-w-md bg-surface-container border border-acid-lime/30 rounded-xl p-4 flex items-center gap-3 shadow-acid animate-slide-up">
      <Icon name="install_mobile" className="text-acid-on text-2xl" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">DROPLY를 홈 화면에</p>
        <p className="text-secondary text-xs">앱처럼 전체화면으로, 드롭 알림까지.</p>
      </div>
      <button onClick={install} className="bg-acid-lime text-black font-bold text-sm px-4 py-2 rounded-lg active:scale-95 transition-all">
        설치
      </button>
      <button onClick={() => setDismissed(true)} aria-label="닫기" className="text-secondary">
        <Icon name="close" className="text-lg" />
      </button>
    </div>
  );
}

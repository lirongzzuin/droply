"use client";

import { useState, useEffect } from "react";
import { Icon } from "./Icon";

/**
 * Web Push 옵트인 — 브라우저 알림 권한 요청 + 구독 stub 저장.
 * (실제 푸시 발송은 Service Worker + VAPID 필요 — 운영 단계 연결)
 */
export function PushOptIn() {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "granted" | "denied">("idle");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setSupported(true);
      if (Notification.permission === "granted") setState("granted");
      else if (Notification.permission === "denied") setState("denied");
    }
  }, []);

  if (!supported || state === "granted") return null;

  async function enable() {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setState("granted");
      try {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: `demo:${Date.now()}` }),
        });
      } catch {
        /* noop */
      }
    } else {
      setState("denied");
    }
  }

  return (
    <button
      onClick={enable}
      disabled={state === "denied"}
      className="w-full mt-stack-lg flex items-center gap-3 p-4 bg-acid-lime/5 border border-acid-lime/20 rounded-xl text-left active:scale-[0.99] transition-all disabled:opacity-60"
    >
      <Icon name="notifications_active" className="text-acid-lime" />
      <span className="flex-1">
        <span className="block font-bold text-acid-lime">푸시 알림 켜기</span>
        <span className="block text-secondary text-sm">{state === "denied" ? "브라우저 설정에서 알림을 허용해 주세요." : "드롭 오픈·입찰 추월·새 메시지를 실시간으로."}</span>
      </span>
      <Icon name="chevron_right" className="text-acid-lime" />
    </button>
  );
}

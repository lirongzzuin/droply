"use client";

import { useState, useEffect } from "react";
import { Icon } from "./Icon";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Web Push 옵트인 — 알림 권한 + (VAPID 설정 시)실제 구독 저장.
 * VAPID 키가 없으면 권한 요청까지만(발송은 운영 단계에서 키 주입 시 활성).
 */
export function PushOptIn() {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "granted" | "denied">("idle");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setSupported(true);
      if (Notification.permission === "granted") setState("granted");
      else if (Notification.permission === "denied") setState("denied");
    }
  }, []);

  if (!supported || state === "granted") return null;

  async function enable() {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setState("denied");
      return;
    }
    setState("granted");
    try {
      const reg = await navigator.serviceWorker.ready;
      let subscription: PushSubscription | { endpoint: string } | null = null;
      if (VAPID && reg.pushManager) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID),
        });
      } else {
        subscription = { endpoint: `permission-only:${Date.now()}` };
      }
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
    } catch {
      /* 구독 실패해도 권한은 부여됨 */
    }
  }

  return (
    <button
      onClick={enable}
      disabled={state === "denied"}
      className="w-full mt-stack-lg flex items-center gap-3 p-4 bg-acid-lime/5 border border-acid-lime/20 rounded-xl text-left active:scale-[0.99] transition-all disabled:opacity-60"
    >
      <Icon name="notifications_active" className="text-acid-on" />
      <span className="flex-1">
        <span className="block font-bold text-acid-on">푸시 알림 켜기</span>
        <span className="block text-secondary text-sm">{state === "denied" ? "브라우저 설정에서 알림을 허용해 주세요." : "드롭 오픈·입찰 추월·새 메시지를 실시간으로."}</span>
      </span>
      <Icon name="chevron_right" className="text-acid-on" />
    </button>
  );
}

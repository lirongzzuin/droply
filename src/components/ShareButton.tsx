"use client";

import { useState } from "react";
import { Icon } from "./Icon";

/** 인증샷/공유 — 네이티브 공유 시트 + 클립보드 폴백 */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} · DROPLY`, url });
        return;
      } catch {
        /* 사용자가 취소 — 폴백으로 진행 */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  return (
    <button onClick={onShare} className="relative text-primary active:scale-95 transition-transform" aria-label="공유">
      <Icon name={copied ? "check" : "ios_share"} className={copied ? "text-acid-on" : ""} />
      {copied && (
        <span className="absolute -bottom-7 right-0 whitespace-nowrap font-mono text-[10px] text-acid-on bg-surface-container px-2 py-1 rounded">
          링크 복사됨
        </span>
      )}
    </button>
  );
}

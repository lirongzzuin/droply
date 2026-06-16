"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { confirmIdentity } from "@/app/actions/payment";
import { PORTONE_STORE_ID, IDENTITY_CHANNEL_KEY, isIdentityConfigured } from "@/lib/payments/channels";

/** 다날 본인인증 — PortOne requestIdentityVerification → 서버 검증 → 신뢰 배지 */
export function IdentityVerifyButton({ alreadyVerified }: { alreadyVerified?: boolean }) {
  const [done, setDone] = useState(alreadyVerified ?? false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isIdentityConfigured()) return null; // 채널 미설정 시 숨김
  if (done) {
    return (
      <div className="mt-stack-md flex items-center gap-2 p-4 bg-acid-lime/5 border border-acid-lime/20 rounded-xl">
        <Icon name="verified" fill className="text-acid-on" />
        <span className="font-bold text-acid-on">본인인증 완료</span>
      </div>
    );
  }

  async function verify() {
    setLoading(true);
    setMsg(null);
    try {
      const PortOne = await import("@portone/browser-sdk/v2");
      const id = `identity-${crypto.randomUUID()}`;
      const res = await PortOne.requestIdentityVerification({
        storeId: PORTONE_STORE_ID,
        identityVerificationId: id,
        channelKey: IDENTITY_CHANNEL_KEY,
      });
      if (res?.code) {
        setMsg(res.message || "본인인증이 취소되었습니다.");
        return;
      }
      const r = await confirmIdentity(res?.identityVerificationId ?? id);
      if (r.ok) setDone(true);
      else setMsg(r.message);
    } catch {
      setMsg("본인인증 처리 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={verify}
      disabled={loading}
      className="mt-stack-md w-full flex items-center gap-3 p-4 bg-surface-container border border-outline-variant rounded-xl text-left active:scale-[0.99] transition-all disabled:opacity-60"
    >
      <Icon name="badge" className="text-acid-on" />
      <span className="flex-1">
        <span className="block font-bold">휴대폰 본인인증</span>
        <span className="block text-secondary text-sm">{loading ? "인증 진행 중…" : msg ?? "인증하면 신뢰 배지가 부여돼요 (다날)."}</span>
      </span>
      <Icon name="chevron_right" className="text-secondary" />
    </button>
  );
}

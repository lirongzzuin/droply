"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Artwork } from "@/types";
import { formatKRW } from "@/lib/utils";
import { Icon } from "./Icon";
import { purchaseFixed, type PurchaseResult } from "@/app/actions/orders";

export function BuyBar({ artwork, loggedIn }: { artwork: Artwork; loggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PurchaseResult | null>(null);
  const keyRef = useRef<string>("");

  async function onBuy() {
    if (!keyRef.current) keyRef.current = crypto.randomUUID();
    setLoading(true);
    try {
      const r = await purchaseFixed(artwork.id, keyRef.current);
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  const price = artwork.fixedPrice ?? 0;

  return (
    <>
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 bg-background/90 glass border-t border-outline-variant p-container-margin">
        <div className="flex gap-3 items-center">
          {artwork.allowDirect && (
            <Link
              href={`/chat/${artwork.id}`}
              className="w-14 h-14 shrink-0 flex items-center justify-center rounded-lg border border-outline-variant text-primary active:scale-95 transition-all"
              aria-label="채팅 직거래"
            >
              <Icon name="chat" />
            </Link>
          )}
          {loggedIn ? (
            <button
              onClick={onBuy}
              disabled={loading}
              className="flex-1 bg-acid-lime text-black py-4 rounded-lg font-bold text-lg shadow-acid active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
            >
              <Icon name="bolt" fill />
              {loading ? "처리 중…" : `바로 구매 ${formatKRW(price)}`}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex-1 bg-acid-lime text-black py-4 rounded-lg font-bold text-lg shadow-acid active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              <Icon name="lock" />
              로그인하고 구매
            </Link>
          )}
        </div>
      </footer>

      {result && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 glass flex items-end md:items-center justify-center p-4"
          onClick={() => setResult(null)}
        >
          <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Icon name={result.ok ? "check_circle" : "error"} fill className={result.ok ? "text-acid-on text-3xl" : "text-error text-3xl"} />
              <h3 className="font-display text-headline-sm">{result.ok ? "주문 생성 완료" : "구매 불가"}</h3>
            </div>
            <p className="text-secondary text-sm mb-4">{result.message}</p>
            {result.ok && (
              <div className="space-y-2 text-sm bg-surface-container-lowest rounded-lg p-4">
                <Row label="주문번호" value={result.orderId!} mono />
                <Row label="결제 금액" value={formatKRW(result.amount)} />
                <Row label="플랫폼 수수료(8%)" value={`- ${formatKRW(result.feeAmount)}`} />
                {result.replayed && <p className="text-acid-on text-[11px] font-mono pt-1">멱등 처리: 중복 요청이 안전하게 무시됨</p>}
              </div>
            )}
            <div className="mt-5 flex gap-2">
              {result.ok && (
                <Link href="/me/orders" className="flex-1 py-3 rounded-lg bg-acid-lime text-black font-bold text-center active:scale-95 transition-all">
                  주문 내역 보기
                </Link>
              )}
              <button onClick={() => setResult(null)} className="flex-1 py-3 rounded-lg border border-outline-variant text-primary active:scale-95 transition-all">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-secondary">{label}</span>
      <span className={mono ? "font-mono text-primary" : "text-primary"}>{value}</span>
    </div>
  );
}

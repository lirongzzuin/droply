"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Artwork } from "@/types";
import { formatKRW } from "@/lib/utils";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { purchaseFixed, type PurchaseResult } from "@/app/actions/orders";
import { confirmPayment } from "@/app/actions/payment";
import { PORTONE_STORE_ID, availablePayMethods, isPortOneConfigured, type PayMethodConfig } from "@/lib/payments/channels";

type Sheet = null | "methods" | "result";

export function BuyBar({ artwork, loggedIn, viewerName }: { artwork: Artwork; loggedIn: boolean; viewerName?: string }) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PurchaseResult | null>(null);
  const keyRef = useRef<string>("");
  const price = artwork.fixedPrice ?? 0;
  const portone = isPortOneConfigured();

  // ── mock 폴백(키 미설정): 기존 즉시구매 ──
  async function mockBuy() {
    if (!keyRef.current) keyRef.current = crypto.randomUUID();
    setLoading(true);
    try {
      setResult(await purchaseFixed(artwork.id, keyRef.current));
      setSheet("result");
    } finally {
      setLoading(false);
    }
  }

  // ── PortOne 실결제 ──
  async function payWith(method: PayMethodConfig) {
    setLoading(true);
    try {
      const PortOne = await import("@portone/browser-sdk/v2");
      const paymentId = `pay-${crypto.randomUUID()}`;
      const res = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID,
        channelKey: method.channelKey,
        paymentId,
        orderName: artwork.title,
        totalAmount: price,
        currency: "CURRENCY_KRW",
        payMethod: method.payMethod,
        customer: { fullName: viewerName || "DROPLY 구매자" },
        redirectUrl: `${window.location.origin}/me/orders?paid=1`,
      });
      // 팝업 취소/실패 시 code 존재
      if (res?.code) {
        setResult({ ok: false, message: res.message || "결제가 취소되었습니다." });
        setSheet("result");
        return;
      }
      // 서버 검증 + 주문 생성
      const confirmed = await confirmPayment(res?.paymentId ?? paymentId, artwork.id);
      setResult({
        ok: confirmed.ok,
        message: confirmed.message,
        orderId: confirmed.orderId,
        amount: price,
        feeAmount: Math.round(price * 0.08),
      });
      setSheet("result");
    } catch (e) {
      setResult({ ok: false, message: "결제 처리 중 오류가 발생했어요." });
      setSheet("result");
    } finally {
      setLoading(false);
    }
  }

  function onBuyClick() {
    if (!loggedIn) return;
    if (portone) setSheet("methods");
    else mockBuy();
  }

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
              onClick={onBuyClick}
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
              <Icon name="lock" /> 로그인하고 구매
            </Link>
          )}
        </div>
      </footer>

      {/* 결제수단 선택 시트 */}
      {sheet === "methods" && (
        <div className="fixed inset-0 z-[60] bg-black/70 glass flex items-end md:items-center justify-center p-4" onClick={() => setSheet(null)}>
          <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-display text-headline-sm">결제 수단</h3>
              <button onClick={() => setSheet(null)} aria-label="닫기"><Icon name="close" className="text-secondary" /></button>
            </div>
            <p className="text-secondary text-sm mb-4">{artwork.title} · <span className="font-mono text-primary">{formatKRW(price)}</span></p>
            <div className="flex flex-col gap-2">
              {availablePayMethods().map((m) => (
                <button
                  key={m.key}
                  onClick={() => payWith(m)}
                  disabled={loading}
                  className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-high border border-outline-variant hover:border-acid-lime transition-colors active:scale-95 disabled:opacity-50"
                >
                  <Icon name={m.icon} className="text-acid-on" />
                  <span className="font-medium">{m.label}</span>
                  <Icon name="chevron_right" className="ml-auto text-secondary" />
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-secondary text-center">플랫폼 수수료 8% · 결제는 PortOne을 통해 안전하게 처리됩니다.</p>
          </div>
        </div>
      )}

      {/* 결과 시트 */}
      {sheet === "result" && result && (
        <div className="fixed inset-0 z-[60] bg-black/70 glass flex items-end md:items-center justify-center p-4" onClick={() => setSheet(null)}>
          <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Icon name={result.ok ? "check_circle" : "error"} fill className={cn("text-3xl", result.ok ? "text-acid-on" : "text-error")} />
              <h3 className="font-display text-headline-sm">{result.ok ? "주문 완료" : "구매 실패"}</h3>
            </div>
            <p className="text-secondary text-sm mb-4">{result.message}</p>
            {result.ok && result.orderId && (
              <div className="space-y-2 text-sm bg-surface-container-lowest rounded-lg p-4">
                <Row label="주문번호" value={result.orderId} mono />
                {result.amount != null && <Row label="결제 금액" value={formatKRW(result.amount)} />}
              </div>
            )}
            <div className="mt-5 flex gap-2">
              {result.ok && (
                <Link href="/me/orders" className="flex-1 py-3 rounded-lg bg-acid-lime text-black font-bold text-center active:scale-95 transition-all">주문 내역</Link>
              )}
              <button onClick={() => setSheet(null)} className="flex-1 py-3 rounded-lg border border-outline-variant text-primary active:scale-95 transition-all">닫기</button>
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

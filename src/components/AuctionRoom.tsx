"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Icon } from "./Icon";
import { formatKRW, formatCount, timeAgo, countdownTo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { placeBidAction } from "@/app/actions/auction";
import type { AuctionView } from "@/lib/services/auction";

interface Props {
  artworkId: string;
  image: string;
  title: string;
  likeCount: number;
  viewerHandle: string | null;
  initial: AuctionView;
}

export function AuctionRoom({ artworkId, image, title, likeCount, viewerHandle, initial }: Props) {
  const [view, setView] = useState<AuctionView>(initial);
  const [input, setInput] = useState(initial.currentPrice + initial.minIncrement);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const inputTouched = useRef(false);

  const cd = countdownTo(view.endsAt, now);

  // 1초 타이머
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 3초 폴링 (경량 라이브 — 상시 WS 대비 운영비 0)
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/auction/${artworkId}`, { cache: "no-store" });
        if (!r.ok) return;
        const v: AuctionView = await r.json();
        if (!alive) return;
        setView(v);
        if (!inputTouched.current) setInput(v.currentPrice + v.minIncrement);
      } catch {
        /* 네트워크 일시 오류 무시 */
      }
    };
    const t = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [artworkId]);

  const flash = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2800);
  }, []);

  async function bid(amount: number) {
    if (!viewerHandle) return flash("로그인이 필요합니다.");
    if (pending) return;
    setPending(true);
    try {
      const res = await placeBidAction(artworkId, amount, crypto.randomUUID());
      if (res.view) {
        setView(res.view);
        inputTouched.current = false;
        setInput(res.view.currentPrice + res.view.minIncrement);
      }
      flash(res.ok ? (res.extended ? `입찰 완료 — 막판 연장됐어요!` : "입찰 완료! 최고가를 기록했어요.") : res.message ?? "입찰 실패");
    } finally {
      setPending(false);
    }
  }

  const ended = cd.done || view.status === "ENDED";
  const isTop = viewerHandle && view.highBidderHandle === viewerHandle;

  return (
    <>
      <main className="pt-16 pb-48">
        <section className="relative w-full aspect-square overflow-hidden">
          <Image src={image} alt={title} fill priority sizes="(max-width:768px) 100vw, 672px" className="object-cover" />
          <div className="absolute top-4 left-4 flex gap-2 items-center">
            <div className="bg-black/60 glass border border-white/10 px-3 py-1.5 flex items-center gap-2 rounded-full">
              <span className={cn("w-2 h-2 rounded-full", ended ? "bg-secondary" : "bg-acid-lime shadow-[0_0_8px_#D4FF3F] animate-pulse-glow")} />
              <span className="font-mono text-label-caps text-white">{ended ? "ENDED" : "LIVE"}</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/60 glass border border-white/10 px-4 py-2 rounded-lg">
            <p className="font-mono text-[10px] text-secondary mb-1">AUCTION ENDS IN</p>
            <div className="font-mono text-headline-sm text-acid-lime tabular-nums" suppressHydrationWarning>
              {ended ? "마감" : `${String(cd.hours).padStart(2, "0")}:${String(cd.minutes).padStart(2, "0")}:${String(cd.seconds).padStart(2, "0")}`}
            </div>
          </div>
        </section>

        <section className="px-container-margin mt-stack-lg">
          <div className="flex flex-col items-center py-6 border-b border-outline-variant">
            <span className="font-mono text-label-caps text-secondary mb-2">{ended ? "최종가" : "현재가"}</span>
            <h2 className="font-display text-[44px] md:text-[64px] font-extrabold text-primary mb-3 tabular-nums" suppressHydrationWarning>
              <span className="text-secondary text-[22px] font-mono mr-2">₩</span>
              {view.currentPrice.toLocaleString("ko-KR")}
            </h2>
            <div className="flex gap-4 text-secondary font-mono text-label-caps">
              <span className="flex items-center gap-1"><Icon name="gavel" className="text-[16px]" /> {view.bidCount}명 입찰</span>
              <span className="flex items-center gap-1"><Icon name="favorite" className="text-[16px]" /> {formatCount(likeCount)}명 관심</span>
            </div>
            {isTop && !ended && <span className="mt-3 text-[11px] font-mono text-acid-lime bg-acid-lime/10 px-3 py-1 rounded-full">현재 내가 최고가 입찰자예요</span>}
          </div>
        </section>

        <section className="px-container-margin mt-stack-lg">
          <div className="flex justify-between items-center mb-stack-md">
            <h3 className="font-display text-headline-sm">입찰 기록</h3>
            {!ended && (
              <span className="text-[12px] text-acid-lime flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-acid-lime animate-pulse-glow" /> 실시간 업데이트 중
              </span>
            )}
          </div>
          <div className="space-y-3">
            {view.bids.length === 0 && <p className="text-secondary text-sm py-6 text-center">아직 입찰이 없어요. 첫 입찰의 주인공이 되어보세요.</p>}
            {view.bids.map((b, i) => (
              <div key={b.id} className={cn("flex justify-between items-center p-4 border rounded-lg", i === 0 ? "bg-surface-container-low border-outline-variant animate-slide-up" : "bg-surface-container-lowest/50 border-outline-variant/30")}>
                <div className="flex items-center gap-3">
                  <span className={cn("relative w-10 h-10 rounded-full overflow-hidden border border-outline-variant", i !== 0 && "opacity-70")}>
                    <Image src={b.bidderAvatar} alt={b.bidderHandle} fill sizes="40px" className="object-cover" />
                  </span>
                  <div>
                    <p className={cn("font-semibold", i === 0 ? "text-primary" : "text-secondary")}>@{b.bidderHandle}</p>
                    <p className="text-[12px] text-secondary" suppressHydrationWarning>{timeAgo(b.createdAt, now)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-mono", i === 0 ? "text-primary" : "text-secondary")}>{formatKRW(b.amount)}</p>
                  {i === 0 && <span className="text-[10px] px-2 py-0.5 bg-acid-lime/10 text-acid-lime rounded uppercase font-mono">Top Bid</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 bg-background/80 glass border-t border-outline-variant px-4 py-5">
        {ended ? (
          <div className="text-center py-2 text-secondary font-mono">경매가 종료되었습니다.</div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Icon name="info" className="text-[14px] text-acid-lime" />
              <p className="text-[11px] text-secondary">마감 {view.antiSnipeSec / 60}분 전 입찰 시 경매가 자동 연장됩니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => bid(view.currentPrice + view.minIncrement)} disabled={pending} className="py-3 border border-outline-variant rounded-lg text-primary font-mono hover:border-acid-lime transition-colors active:scale-95 disabled:opacity-50">
                +{formatKRW(view.minIncrement)}
              </button>
              <button onClick={() => bid(view.currentPrice + view.minIncrement * 4)} disabled={pending} className="py-3 border border-outline-variant rounded-lg text-primary font-mono hover:border-acid-lime transition-colors active:scale-95 disabled:opacity-50">
                +{formatKRW(view.minIncrement * 4)}
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-grow flex items-center bg-surface-container-high border border-outline-variant rounded-lg px-4">
                <span className="text-secondary font-mono mr-2">₩</span>
                <input type="number" value={input} onChange={(e) => { inputTouched.current = true; setInput(Number(e.target.value)); }} className="bg-transparent border-none text-primary font-mono outline-none w-full py-3.5" />
              </div>
              <button onClick={() => bid(input)} disabled={pending} className="bg-acid-lime text-black font-display text-headline-sm px-8 rounded-lg shadow-acid active:scale-95 transition-transform disabled:opacity-50">
                {pending ? "…" : "입찰"}
              </button>
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-48 left-1/2 -translate-x-1/2 z-[60] bg-surface-container-high border border-acid-lime/40 text-primary px-5 py-3 rounded-full text-sm shadow-acid animate-slide-up max-w-[90%] text-center">
          {toast}
        </div>
      )}
    </>
  );
}

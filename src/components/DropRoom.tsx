"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "./Icon";
import { CountdownBlocks } from "./Countdown";
import { useUI } from "@/store/ui";
import { cn, countdownTo } from "@/lib/utils";
import { buyDropAction } from "@/app/actions/drop";
import type { DropView } from "@/lib/services/drop";

interface Props {
  artworkId: string;
  title: string;
  description: string;
  medium: string;
  artistName: string;
  heroImage: string;
  detailImage: string;
  loggedIn: boolean;
  initial: DropView;
}

export function DropRoom(props: Props) {
  const { artworkId, title, description, medium, artistName, heroImage, detailImage, loggedIn, initial } = props;
  const [view, setView] = useState<DropView>(initial);
  const [now, setNow] = useState(() => Date.now());
  const [queue, setQueue] = useState<number | null>(null);
  const [bought, setBought] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const keyRef = useRef("");

  const notified = useUI((s) => s.notified[artworkId] ?? false);
  const setNotified = useUI((s) => s.setNotified);

  const cd = countdownTo(view.dropAt, now);
  const live = cd.done || view.live;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 라이브 시 재고 폴링
  useEffect(() => {
    if (!live) return;
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/drop/${artworkId}`, { cache: "no-store" });
        if (r.ok && alive) setView(await r.json());
      } catch {
        /* noop */
      }
    };
    const t = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [artworkId, live]);

  async function cop() {
    if (!loggedIn) return setToast("로그인이 필요합니다.");
    if (!keyRef.current) keyRef.current = crypto.randomUUID();
    // 가상 웨이팅룸 — 동시 입장 토큰 시뮬레이션
    let pos = 1248;
    setQueue(pos);
    const t = setInterval(async () => {
      pos -= Math.floor(Math.random() * 220) + 60;
      if (pos > 0) {
        setQueue(pos);
        return;
      }
      clearInterval(t);
      setQueue(null);
      const res = await buyDropAction(artworkId, keyRef.current);
      if (res.view) setView(res.view);
      if (res.ok) setBought(true);
      else setToast(res.message ?? "구매 실패");
      setTimeout(() => setToast(null), 3000);
    }, 600);
  }

  const pct = Math.round((view.remaining / view.totalStock) * 100);

  return (
    <main className="relative pt-16 pb-24 flex flex-col items-center">
      <section className="relative w-full min-h-[600px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt={title} fill priority sizes="(max-width:768px) 100vw, 672px" className="object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="relative z-10 flex flex-col items-center animate-reveal-up w-full px-6">
          <div className="mb-6 flex gap-4 items-center">
            <span className="px-3 py-1 bg-acid-lime text-black font-mono text-label-caps rounded">EXCLUSIVE DROP</span>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full animate-pulse-glow", live ? "bg-error" : "bg-acid-lime")} />
              <span className={cn("font-mono text-label-caps tracking-widest", live ? "text-error" : "text-acid-on")}>{live ? "LIVE NOW" : "LIVE IN"}</span>
            </div>
          </div>

          {!live ? (
            <>
              <CountdownBlocks target={view.dropAt} />
              <div className="mt-12 flex flex-col items-center gap-8 w-full max-w-md">
                <div className="flex justify-between w-full border-y border-outline-variant/30 py-4 font-mono text-secondary text-sm">
                  <span className="flex items-center gap-1"><Icon name="inventory_2" className="text-[18px]" /> 한정 · {view.totalStock}점</span>
                  <span className="flex items-center gap-1"><Icon name="person" className="text-[18px]" /> 1인 {view.perUserLimit}점 한정</span>
                </div>
                <button
                  onClick={() => loggedIn && setNotified(artworkId)}
                  disabled={notified}
                  className={cn("w-full font-mono py-5 shadow-acid active:scale-95 transition-transform flex items-center justify-center gap-3", notified ? "bg-white text-black" : "bg-acid-lime text-black")}
                  suppressHydrationWarning
                >
                  <Icon name={notified ? "check" : "notifications_active"} />
                  {notified ? "알림 신청 완료" : loggedIn ? "알림 받기 (NOTIFY ME)" : "로그인하고 알림 받기"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-6 w-full max-w-md">
              <div className="w-full flex justify-between items-center">
                <span className="text-acid-on font-mono text-label-caps flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-acid-lime animate-pulse-glow" /> LIVE STOCK
                </span>
                <span className="font-mono text-white"><span className="text-acid-on">{view.remaining}</span> / {view.totalStock} 남음</span>
              </div>
              <div className="w-full h-1 bg-surface-container-highest">
                <div className="h-full bg-acid-lime shadow-[0_0_10px_#D4FF3F] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              {bought ? (
                <div className="w-full bg-acid-lime/10 border border-acid-lime/30 rounded-lg p-6 text-center">
                  <Icon name="celebration" fill className="text-acid-on text-4xl mb-2" />
                  <p className="font-display text-headline-sm text-acid-on">구매 성공!</p>
                  <p className="text-secondary text-sm mt-1">한정 드롭을 손에 넣었어요. 주문 내역에서 확인하세요.</p>
                </div>
              ) : view.soldOut ? (
                <div className="w-full bg-surface-container border border-outline-variant rounded-lg p-6 text-center text-secondary font-mono">SOLD OUT</div>
              ) : (
                <button onClick={cop} className="w-full bg-acid-lime text-black font-display text-headline-sm py-5 shadow-acid active:scale-95 transition-transform flex flex-col items-center leading-none">
                  <span className="tracking-tighter">구매하기 (COP NOW)</span>
                  <span className="font-mono text-[10px] mt-1 opacity-70">대기열 입장</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="w-full overflow-hidden bg-acid-lime py-2 border-y border-black z-20 -rotate-1 scale-105 my-8">
        <div className="animate-marquee flex gap-12 text-black font-mono text-label-caps font-bold whitespace-nowrap">
          {[...Array(2)].map((_, k) => (
            <span key={k} className="flex gap-12">
              <span>NEW ARRIVAL: {title.toUpperCase()}</span>
              <span>LIMITED {view.totalStock} PIECES</span>
              <span>1인 {view.perUserLimit}점 한정</span>
              <span>DROPLY EXCLUSIVE</span>
            </span>
          ))}
        </div>
      </div>

      <section className="w-full px-container-margin grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-display text-display-lg tracking-tight uppercase leading-[0.9]">{title}</h2>
          <p className="text-secondary leading-relaxed">{description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-outline-variant/30 bg-surface-container-low">
              <span className="block font-mono text-secondary text-[10px] mb-1">ARTIST</span>
              <span className="block font-bold">{artistName}</span>
            </div>
            <div className="p-4 border border-outline-variant/30 bg-surface-container-low">
              <span className="block font-mono text-secondary text-[10px] mb-1">MEDIUM</span>
              <span className="block font-bold">{medium}</span>
            </div>
          </div>
        </div>
        <div className="relative aspect-square bg-surface-container-highest p-1 shadow-acid border border-acid-lime/20">
          <Image src={detailImage} alt={title} fill sizes="(max-width:768px) 100vw, 336px" className="object-cover" />
        </div>
      </section>

      {queue != null && (
        <div className="fixed inset-0 z-[60] glass bg-black/80 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md p-8 border border-acid-lime bg-black/80 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-acid-lime border-t-transparent rounded-full animate-spin mb-8" />
            <h3 className="font-display text-headline-md mb-2">대기열 대기 중…</h3>
            <p className="text-secondary mb-8">현재 많은 사용자가 동시 접속 중입니다.<br />잠시만 기다려 주세요.</p>
            <div className="w-full bg-surface-container p-4 mb-4">
              <span className="font-mono text-secondary text-[10px] block mb-2 uppercase">Your Position</span>
              <span className="font-display text-display-lg text-acid-on tracking-tighter">#{queue.toLocaleString()}</span>
            </div>
            <p className="font-mono text-[10px] text-error">※ 새로고침 시 순서가 밀릴 수 있습니다.</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-surface-container-high border border-acid-lime/40 text-primary px-5 py-3 rounded-full text-sm shadow-acid animate-slide-up max-w-[90%] text-center">
          {toast}
        </div>
      )}
    </main>
  );
}

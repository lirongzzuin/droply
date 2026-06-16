"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/types";
import { Icon } from "./Icon";
import { formatKRW, cn, timeAgo } from "@/lib/utils";
import { checkFraud, type FraudCheckResult } from "@/app/actions/fraud";
import { sendMessageAction, reportAction } from "@/app/actions/chat";

interface MsgVM {
  id: string;
  mine: boolean;
  body?: string;
  createdAt: string;
}

export function ChatRoom({
  artwork,
  peerHandle,
  viewerId,
  initialMessages,
}: {
  artwork: Artwork;
  peerHandle: string;
  viewerId: string;
  initialMessages: { id: string; senderId: string; body?: string; createdAt: string }[];
}) {
  const [msgs, setMsgs] = useState<MsgVM[]>(
    initialMessages.map((m) => ({ id: m.id, mine: m.senderId === viewerId, body: m.body, createdAt: m.createdAt })),
  );
  const [text, setText] = useState("");
  const [fraudOpen, setFraudOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    const optimistic: MsgVM = { id: "tmp" + Date.now(), mine: true, body, createdAt: new Date().toISOString() };
    setMsgs((m) => [...m, optimistic]);
    const res = await sendMessageAction(artwork.id, body);
    if (res.ok) setMsgs((m) => m.map((x) => (x.id === optimistic.id ? { ...x, id: res.message.id } : x)));
  }

  async function report() {
    await reportAction("CHAT", artwork.id, "직거래 채팅 신고");
    setReported(true);
    setTimeout(() => setReported(false), 2600);
  }

  return (
    <>
      <div className="bg-primary-container/10 border-b border-outline-variant/30 py-2 px-container-margin flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="shield" className="text-primary-fixed-dim text-sm" />
          <span className="text-[13px] text-on-surface-variant truncate">입금 전 판매자 신뢰도를 꼭 확인하세요</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={report} className="text-[11px] font-mono text-secondary hover:text-error transition-colors" aria-label="신고">
            {reported ? "신고 접수됨" : "신고"}
          </button>
          <button onClick={() => setFraudOpen(true)} className="bg-surface-container-highest/50 px-3 py-1 rounded-full text-[11px] font-mono text-primary border border-outline-variant hover:bg-surface-container-high transition-colors">
            사기이력 조회
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low/80 glass border-b border-outline-variant p-3 flex items-center gap-4">
        <Link href={`/art/${artwork.id}`} className="relative w-16 h-16 bg-surface-container-highest overflow-hidden rounded-lg shrink-0 border border-outline-variant">
          <Image src={artwork.images[0]} alt={artwork.title} fill sizes="64px" className="object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary truncate">{artwork.title}</h3>
          <p className="font-mono text-primary-fixed-dim mt-1">{formatKRW(artwork.displayPrice)}</p>
        </div>
        <Link href={`/art/${artwork.id}`} className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded font-mono text-xs shadow-acid">상세</Link>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-container-margin flex flex-col gap-5 no-scrollbar">
        <div className="flex justify-center">
          <span className="text-[10px] font-mono text-secondary bg-surface-container-high/50 px-4 py-1 rounded-full">TODAY</span>
        </div>
        {msgs.map((m) =>
          m.mine ? (
            <div key={m.id} className="flex flex-col gap-1 items-end max-w-[85%] self-end">
              <div className="rounded-[16px_16px_2px_16px] bg-primary-fixed text-on-primary-fixed p-4 text-[15px] font-medium">{m.body}</div>
              <span className="text-[10px] text-secondary mr-1" suppressHydrationWarning>{timeAgo(m.createdAt, now)} · 읽음</span>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3 max-w-[85%]">
              <span className="relative w-8 h-8 rounded-full overflow-hidden border border-outline-variant shrink-0 self-end">
                <Image src={`https://picsum.photos/seed/${peerHandle}-ava/200/200`} alt={peerHandle} fill sizes="32px" className="object-cover" />
              </span>
              <div className="flex flex-col gap-1">
                <div className="rounded-[2px_16px_16px_16px] bg-surface-container-high text-on-surface p-4 text-[15px] border border-outline-variant/30">{m.body}</div>
                <span className="text-[10px] text-secondary ml-1" suppressHydrationWarning>{timeAgo(m.createdAt, now)}</span>
              </div>
            </div>
          ),
        )}
        <div className="flex flex-col items-center gap-2 my-2">
          <div className="flex items-center gap-2 bg-surface-container/50 border border-outline-variant/20 px-4 py-2 rounded-xl max-w-sm">
            <Icon name="security" className="text-primary-fixed-dim text-sm" />
            <p className="text-[11px] text-secondary text-center">DROPLY는 직접 이체 거래 사기에 책임지지 않습니다. 거래 전 판매자 정보를 다시 확인하세요.</p>
          </div>
        </div>
      </div>

      <div className="bg-background/80 glass border-t border-outline-variant p-container-margin">
        <div className="flex items-center gap-3">
          <button className="text-secondary hover:text-primary transition-colors"><Icon name="add_circle" /></button>
          <div className="flex-1 relative">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-surface-container border-none rounded-full px-5 py-3 text-[15px] outline-none focus:ring-1 focus:ring-primary-fixed placeholder:text-secondary/50"
            />
            <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-fixed text-on-primary-fixed w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all">
              <Icon name="arrow_upward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>

      {fraudOpen && <FraudModal onClose={() => setFraudOpen(false)} />}
    </>
  );
}

function FraudModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"ACCOUNT" | "PHONE">("ACCOUNT");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudCheckResult | null>(null);

  async function run() {
    setLoading(true);
    try {
      setResult(await checkFraud(type, value));
    } finally {
      setLoading(false);
    }
  }

  const riskColor = result?.riskLevel === "DANGER" ? "text-error" : result?.riskLevel === "CAUTION" ? "text-primary-fixed-dim" : "text-acid-lime";

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 glass flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="shield" fill className="text-acid-lime" />
          <h3 className="font-display text-headline-sm">사기이력 조회</h3>
        </div>
        <p className="text-secondary text-xs mb-4">입력값은 암호화 해시로만 조회되며 평문은 저장되지 않습니다.</p>
        <div className="flex gap-2 mb-3">
          {(["ACCOUNT", "PHONE"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("flex-1 py-2 rounded-lg font-mono text-xs border transition-colors", type === t ? "bg-acid-lime text-black border-acid-lime" : "bg-surface-container-high text-secondary border-outline-variant")}>
              {t === "ACCOUNT" ? "계좌번호" : "전화번호"}
            </button>
          ))}
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
          placeholder={type === "ACCOUNT" ? "숫자만 입력 (예: 110234567890)" : "숫자만 입력 (예: 01012345678)"}
          className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-primary outline-none focus:border-acid-lime mb-3"
        />
        <button onClick={run} disabled={loading} className="w-full bg-acid-lime text-black font-bold py-3 rounded-lg active:scale-95 transition-all disabled:opacity-50">
          {loading ? "조회 중…" : "조회하기"}
        </button>
        {result && (
          <div className="mt-4 p-4 rounded-lg bg-surface-container-lowest border border-outline-variant">
            {result.ok ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={result.riskLevel === "SAFE" ? "verified_user" : "warning"} fill className={riskColor} />
                  <span className={cn("font-bold", riskColor)}>{result.riskLevel === "SAFE" ? "안전" : result.riskLevel === "CAUTION" ? "주의" : "위험"}</span>
                </div>
                <p className="text-secondary text-sm">{result.message}</p>
                <p className="text-[10px] text-secondary/50 font-mono mt-2 break-all">hash: {result.hashedKey.slice(0, 24)}…</p>
              </>
            ) : (
              <p className="text-error text-sm">{result.message}</p>
            )}
          </div>
        )}
        <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-lg border border-outline-variant text-secondary">닫기</button>
      </div>
    </div>
  );
}

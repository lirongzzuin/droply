"use client";

import { useEffect, useState } from "react";
import { countdownTo, countdownLabel, type Countdown as CD } from "@/lib/utils";

/** 1초 틱 카운트다운 — 라벨 또는 분해 단위(블록)로 렌더 */
export function useCountdown(targetIso: string): CD {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return countdownTo(targetIso, now);
}

export function CountdownText({ target, className }: { target: string; className?: string }) {
  const cd = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={className} suppressHydrationWarning>
      {cd.done ? "종료" : cd.days > 0 ? countdownLabel(cd) : `${pad(cd.hours)}:${pad(cd.minutes)}:${pad(cd.seconds)}`}
    </span>
  );
}

const Block = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-display text-display-lg md:text-display-xl text-white tracking-tighter tabular-nums" suppressHydrationWarning>
      {String(value).padStart(2, "0")}
    </span>
    <span className="font-mono text-label-caps text-secondary">{label}</span>
  </div>
);

const Colon = () => <span className="font-display text-display-lg md:text-display-xl text-acid-lime mb-6">:</span>;

/** 드롭 히어로용 거대 블록 카운트다운 */
export function CountdownBlocks({ target }: { target: string }) {
  const cd = useCountdown(target);
  return (
    <div className="flex gap-4 md:gap-8 items-end" suppressHydrationWarning>
      <Block value={cd.days} label="DAYS" />
      <Colon />
      <Block value={cd.hours} label="HOURS" />
      <Colon />
      <Block value={cd.minutes} label="MINS" />
      <Colon />
      <Block value={cd.seconds} label="SECS" />
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₩ 포맷 — 천 단위 구분, 정수 원 */
export function formatKRW(value?: number | null): string {
  if (value == null) return "—";
  return "₩" + Math.round(value).toLocaleString("ko-KR");
}

/** 좋아요 카운트 등 축약 (1,204 / 2.1K) */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return Math.round(n / 1000) + "K";
}

/** 상대 시간 (방금 / N분 전 / N시간 전 / N일 전) */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export interface Countdown {
  total: number; // ms 남음 (0 이하면 종료)
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

/** 카운트다운 분해 (드롭/경매 타이머 공용) */
export function countdownTo(targetIso: string, now: number = Date.now()): Countdown {
  const total = Math.max(0, new Date(targetIso).getTime() - now);
  const sec = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
    done: total <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 경매용 HH:MM:SS, 드롭용 d일 HH:MM 등 사람이 읽는 라벨 */
export function countdownLabel(c: Countdown): string {
  if (c.done) return "종료";
  if (c.days > 0) return `${c.days}일 ${c.hours}시간`;
  return `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`;
}

/** 마감임박 여부 (24시간 이내) */
export function isEndingSoon(c: Countdown): boolean {
  return !c.done && c.total <= 24 * 3600 * 1000;
}

import type { Artwork } from "@/types";
import { countdownTo, countdownLabel } from "@/lib/utils";
import { CountdownText } from "./Countdown";

/** 피드/상세 우상단 판매 상태 배지 — 시안의 LIVE/드롭/정가 칩 */
export function SaleBadge({ artwork }: { artwork: Artwork }) {
  if (artwork.saleType === "AUCTION" && artwork.auction) {
    const live = artwork.auction.status === "LIVE";
    return (
      <span className="flex items-center gap-1.5 bg-acid-lime text-black px-3 py-1.5 rounded font-mono text-label-caps font-bold shadow-acid">
        <span className="w-2 h-2 rounded-full bg-black animate-pulse-glow" />
        경매 · {live ? "LIVE" : "예정"}
      </span>
    );
  }
  if (artwork.saleType === "DROP" && artwork.drop) {
    const cd = countdownTo(artwork.drop.dropAt);
    return (
      <span className="bg-white text-black px-3 py-1.5 rounded font-mono text-label-caps font-bold">
        드롭 · {cd.done ? "LIVE" : <CountdownText target={artwork.drop.dropAt} />}
      </span>
    );
  }
  return (
    <span className="bg-black/70 glass text-white px-3 py-1.5 rounded font-mono text-label-caps">
      정가 판매
    </span>
  );
}

/** 작은 인라인 라벨 (그리드 카드용) */
export function statusText(artwork: Artwork): string {
  if (artwork.saleType === "AUCTION" && artwork.auction)
    return artwork.auction.status === "LIVE" ? "LIVE" : "경매";
  if (artwork.saleType === "DROP" && artwork.drop)
    return countdownLabel(countdownTo(artwork.drop.dropAt));
  return "정가";
}

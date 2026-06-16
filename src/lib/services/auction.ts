import "server-only";
import { state, nextId, type AuctionState, type BidRecord } from "../server-state";
import { withLock } from "../lock";
import { withIdempotency } from "../idempotency";
import { createNotification } from "./notifications";

export interface AuctionView {
  artworkId: string;
  status: AuctionState["status"];
  currentPrice: number;
  minIncrement: number;
  bidCount: number;
  highBidderHandle?: string;
  endsAt: string;
  version: number;
  antiSnipeSec: number;
  bids: BidRecord[];
}

export function getAuction(artworkId: string): AuctionState | undefined {
  return state().auctions.get(artworkId);
}

export function toView(a: AuctionState): AuctionView {
  return {
    artworkId: a.artworkId,
    status: a.status,
    currentPrice: a.currentPrice,
    minIncrement: a.minIncrement,
    bidCount: a.bids.length,
    highBidderHandle: a.highBidderHandle,
    endsAt: a.endsAt,
    version: a.version,
    antiSnipeSec: a.antiSnipeSec,
    bids: a.bids.slice(0, 30),
  };
}

export interface BidInput {
  artworkId: string;
  bidderId: string;
  bidderHandle: string;
  bidderAvatar: string;
  amount: number;
  idempotencyKey: string;
}

export interface BidResult {
  ok: boolean;
  code?: "NOT_LIVE" | "TOO_LOW" | "ENDED" | "SELF" | "NOT_FOUND";
  message?: string;
  view?: AuctionView;
  extended?: boolean;
  replayed?: boolean;
}

/**
 * 입찰 — 분산락 + 낙관적 락(version) + 멱등 + 최소호가 + 앤티스나이핑.
 * 동일 멱등키 재요청은 최초 결과를 반환(중복 입찰 무시).
 */
export async function placeBid(input: BidInput): Promise<BidResult> {
  const { artworkId, bidderId, bidderHandle, bidderAvatar, amount, idempotencyKey } = input;

  const run = async (): Promise<BidResult> =>
    withLock(`auction:${artworkId}`, async () => {
      const a = closeIfDue(getAuction(artworkId));
      if (!a) return { ok: false, code: "NOT_FOUND", message: "경매를 찾을 수 없습니다." };
      if (a.status === "ENDED" || a.status === "CANCELLED")
        return { ok: false, code: "ENDED", message: "이미 종료된 경매입니다.", view: toView(a) };
      if (a.status !== "LIVE") return { ok: false, code: "NOT_LIVE", message: "진행 중인 경매가 아닙니다.", view: toView(a) };
      if (a.highBidderId && a.highBidderId === bidderId)
        return { ok: false, code: "SELF", message: "이미 최고가 입찰자입니다.", view: toView(a) };

      const minAllowed = a.currentPrice + a.minIncrement;
      if (amount < minAllowed)
        return { ok: false, code: "TOO_LOW", message: `최소 ${minAllowed.toLocaleString("ko-KR")}원 이상 입찰해야 합니다.`, view: toView(a) };

      // 앤티-스나이핑: 마감 antiSnipeSec 이내 입찰 시 연장
      const now = Date.now();
      const remaining = new Date(a.endsAt).getTime() - now;
      let extended = false;
      if (remaining <= a.antiSnipeSec * 1000) {
        a.endsAt = new Date(now + a.antiSnipeSec * 1000).toISOString();
        extended = true;
      }

      // 이전 최고가 입찰자에게 추월 알림
      const prevHighId = a.highBidderId;

      const bid: BidRecord = {
        id: nextId("bid"),
        bidderId,
        bidderHandle,
        bidderAvatar,
        amount,
        createdAt: new Date().toISOString(),
      };
      a.bids.unshift(bid);
      a.currentPrice = amount;
      a.highBidderHandle = bidderHandle;
      a.highBidderId = bidderId;
      a.version += 1; // 낙관적 락 버전 증가

      if (prevHighId && prevHighId !== bidderId) {
        createNotification({
          userId: prevHighId,
          type: "OUTBID",
          title: "입찰이 추월됐어요",
          body: `더 높은 입찰가(${amount.toLocaleString("ko-KR")}원)가 등록됐습니다.`,
          link: `/auction/${artworkId}`,
        });
      }

      return { ok: true, view: toView(a), extended };
    });

  const { result, replayed } = await withIdempotency(idempotencyKey, input, run);
  return { ...result, replayed };
}

/** 마감 시각 경과 시 자동 종료(낙찰/유찰) — 멱등 가드. 읽기/입찰 진입 시 호출. */
export function closeIfDue(a?: AuctionState): AuctionState | undefined {
  if (!a) return a;
  if (a.status !== "LIVE") return a;
  if (new Date(a.endsAt).getTime() > Date.now()) return a;
  return closeAuction(a.artworkId) ?? a;
}

export function closeAuction(artworkId: string): AuctionState | undefined {
  const a = getAuction(artworkId);
  if (!a || a.status === "ENDED" || a.status === "CANCELLED") return a;

  const reserveMet = a.reservePrice == null || a.currentPrice >= a.reservePrice;
  const hasWinner = a.bids.length > 0 && reserveMet;
  a.status = "ENDED";

  if (hasWinner && a.highBidderId) {
    createNotification({
      userId: a.highBidderId,
      type: "WON",
      title: "낙찰됐어요! 🎉",
      body: `${a.currentPrice.toLocaleString("ko-KR")}원에 낙찰되었습니다. 결제를 진행해 주세요.`,
      link: `/art/${artworkId}`,
    });
  }
  return a;
}

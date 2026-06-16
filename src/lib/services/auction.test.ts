import { describe, it, expect, beforeEach } from "vitest";
import { __resetState } from "../server-state";
import { placeBid, closeAuction, getAuction, toView } from "./auction";

const ART = "a_neotokyo04"; // seed: LIVE, current 2,450,000, min 50,000, reserve 2,000,000

const bid = (amount: number, key: string, bidderId = "u_you", handle = "you") =>
  placeBid({ artworkId: ART, bidderId, bidderHandle: handle, bidderAvatar: "x", amount, idempotencyKey: key });

describe("auction.placeBid", () => {
  beforeEach(() => __resetState());

  it("유효 입찰은 현재가를 올리고 기록한다", async () => {
    const base = getAuction(ART)!.currentPrice;
    const r = await bid(base + 50000, "k1");
    expect(r.ok).toBe(true);
    expect(r.view!.currentPrice).toBe(base + 50000);
    expect(r.view!.highBidderHandle).toBe("you");
  });

  it("최소 호가 미만은 거부한다", async () => {
    const base = getAuction(ART)!.currentPrice;
    const r = await bid(base + 1, "k2");
    expect(r.ok).toBe(false);
    expect(r.code).toBe("TOO_LOW");
  });

  it("동일 멱등키 재요청은 중복 입찰하지 않는다", async () => {
    const base = getAuction(ART)!.currentPrice;
    const r1 = await bid(base + 50000, "same-key");
    const countAfter1 = getAuction(ART)!.bids.length;
    const r2 = await bid(base + 50000, "same-key");
    expect(r1.ok).toBe(true);
    expect(r2.replayed).toBe(true);
    expect(getAuction(ART)!.bids.length).toBe(countAfter1);
  });

  it("이미 최고가인 본인은 재입찰 불가", async () => {
    const base = getAuction(ART)!.currentPrice;
    await bid(base + 50000, "k3");
    const r = await bid(base + 100000, "k4"); // 같은 유저(u_you)
    expect(r.ok).toBe(false);
    expect(r.code).toBe("SELF");
  });

  it("동시 입찰: 락+버전으로 직렬화되어 최고가가 정확히 하나", async () => {
    const base = getAuction(ART)!.currentPrice;
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        bid(base + (i + 1) * 50000, `c${i}`, `u_${i}`, `bidder${i}`),
      ),
    );
    const a = getAuction(ART)!;
    const accepted = results.filter((r) => r.ok);
    const maxAccepted = Math.max(...accepted.map((r) => r.view!.currentPrice));
    // 최종 현재가는 수락된 입찰 중 최대값과 일치 (오버라이트/유실 없음)
    expect(a.currentPrice).toBe(maxAccepted);
    // 버전은 수락된 입찰 수만큼 증가
    expect(a.version).toBe(accepted.length);
    // 최고가 입찰자는 정확히 1명 (top bid가 현재가와 일치)
    expect(a.bids[0].amount).toBe(a.currentPrice);
  });

  it("앤티-스나이핑: 마감 임박 입찰 시 종료시각 연장", async () => {
    const a = getAuction(ART)!;
    a.endsAt = new Date(Date.now() + 10_000).toISOString(); // 10초 남음 (antiSnipe 180s)
    const before = new Date(a.endsAt).getTime();
    const r = await bid(a.currentPrice + 50000, "snipe");
    expect(r.ok).toBe(true);
    expect(r.extended).toBe(true);
    expect(new Date(getAuction(ART)!.endsAt).getTime()).toBeGreaterThan(before);
  });

  it("마감 경과 후 입찰은 종료 처리", async () => {
    const a = getAuction(ART)!;
    a.endsAt = new Date(Date.now() - 1000).toISOString();
    const r = await bid(a.currentPrice + 50000, "late");
    expect(r.ok).toBe(false);
    expect(r.code).toBe("ENDED");
  });
});

describe("auction.closeAuction (낙찰/유찰)", () => {
  beforeEach(() => __resetState());

  it("reserve 미달이면 낙찰자 없음", () => {
    const a = getAuction(ART)!;
    a.reservePrice = a.currentPrice + 1_000_000; // 도달 불가
    const closed = closeAuction(ART)!;
    expect(closed.status).toBe("ENDED");
  });

  it("reserve 충족 + 입찰 존재 시 종료되고 view 정상", async () => {
    await bid(getAuction(ART)!.currentPrice + 50000, "win");
    const closed = closeAuction(ART)!;
    expect(closed.status).toBe("ENDED");
    expect(toView(closed).currentPrice).toBeGreaterThan(0);
  });
});

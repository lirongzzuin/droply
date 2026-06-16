import { describe, it, expect, beforeEach } from "vitest";
import { __resetState } from "../server-state";
import { buyDrop, getDrop as getDropState } from "./drop";

const ART = "a_cybersonic";

function makeLive(stock: number, perUser = 1) {
  const d = getDropState(ART)!;
  d.dropAt = new Date(Date.now() - 1000).toISOString();
  d.totalStock = stock;
  d.soldStock = 0;
  d.perUserLimit = perUser;
  d.buyers = {};
}

describe("drop.buyDrop", () => {
  beforeEach(() => __resetState());

  it("드롭 시작 전엔 구매 불가", async () => {
    const d = getDropState(ART)!;
    d.dropAt = new Date(Date.now() + 60_000).toISOString();
    const r = await buyDrop({ artworkId: ART, userId: "u_you", idempotencyKey: "p0" });
    expect(r.ok).toBe(false);
    expect(r.code).toBe("NOT_LIVE");
  });

  it("동시 구매 시 오버셀 0 — 재고만큼만 판매", async () => {
    makeLive(3);
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => buyDrop({ artworkId: ART, userId: `u_${i}`, idempotencyKey: `k${i}` })),
    );
    const ok = results.filter((r) => r.ok);
    expect(ok.length).toBe(3); // 정확히 재고만큼
    const d = getDropState(ART)!;
    expect(d.soldStock).toBe(3);
    expect(d.totalStock - d.soldStock).toBe(0);
    expect(results.filter((r) => r.code === "SOLD_OUT").length).toBe(7);
  });

  it("1인 구매 제한 초과 거부", async () => {
    makeLive(10, 1);
    const a = await buyDrop({ artworkId: ART, userId: "u_one", idempotencyKey: "a1" });
    const b = await buyDrop({ artworkId: ART, userId: "u_one", idempotencyKey: "a2" });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(false);
    expect(b.code).toBe("LIMIT");
  });

  it("멱등키 재요청은 재고를 추가 차감하지 않는다", async () => {
    makeLive(10, 5);
    await buyDrop({ artworkId: ART, userId: "u_two", idempotencyKey: "dup" });
    const soldAfter1 = getDropState(ART)!.soldStock;
    const r2 = await buyDrop({ artworkId: ART, userId: "u_two", idempotencyKey: "dup" });
    expect(r2.replayed).toBe(true);
    expect(getDropState(ART)!.soldStock).toBe(soldAfter1);
  });
});

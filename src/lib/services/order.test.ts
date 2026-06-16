import { describe, it, expect, beforeEach } from "vitest";
import { __resetState } from "../server-state";
import { createOrder, listMyOrders } from "./order";

const ART = "a_resonance2"; // FIXED, 120,000, allowPg+allowDirect, artist u_kaelo

describe("order.createOrder", () => {
  beforeEach(() => __resetState());

  it("PG 결제는 8% 수수료로 PAID 주문 생성", async () => {
    const r = await createOrder({ artworkId: ART, buyerId: "u_you", method: "PG", amount: 120000, idempotencyKey: "o1" });
    expect(r.ok).toBe(true);
    expect(r.order!.status).toBe("PAID");
    expect(r.order!.feeAmount).toBe(9600);
    expect(r.order!.payoutAmount).toBe(110400);
    expect(r.order!.pgTxnId).toBeTruthy();
  });

  it("직거래는 수수료 0, PENDING", async () => {
    const r = await createOrder({ artworkId: ART, buyerId: "u_you", method: "DIRECT_TRANSFER", amount: 120000, idempotencyKey: "o2" });
    expect(r.ok).toBe(true);
    expect(r.order!.status).toBe("PENDING");
    expect(r.order!.feeAmount).toBe(0);
    expect(r.order!.payoutAmount).toBe(120000);
  });

  it("멱등키 재요청은 주문을 중복 생성하지 않는다", async () => {
    await createOrder({ artworkId: ART, buyerId: "u_you", method: "PG", amount: 120000, idempotencyKey: "dup-o" });
    const r2 = await createOrder({ artworkId: ART, buyerId: "u_you", method: "PG", amount: 120000, idempotencyKey: "dup-o" });
    expect(r2.replayed).toBe(true);
    expect(listMyOrders("u_you").length).toBe(1);
  });

  it("본인 작품은 구매 불가", async () => {
    const r = await createOrder({ artworkId: ART, buyerId: "u_kaelo", method: "PG", amount: 120000, idempotencyKey: "self-o" });
    expect(r.ok).toBe(false);
  });
});

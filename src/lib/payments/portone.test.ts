import { describe, it, expect } from "vitest";
import { isPaymentValid, type PortOnePayment } from "./portone";

const make = (status: string, total: number): PortOnePayment => ({ status, amount: { total } });

describe("isPaymentValid (PortOne 결제 검증)", () => {
  it("PAID + 금액 일치 → ok, 즉시 확정", () => {
    expect(isPaymentValid(make("PAID", 120000), 120000)).toEqual({ ok: true, pending: false });
  });

  it("가상계좌 발급 → ok이지만 입금대기(pending)", () => {
    expect(isPaymentValid(make("VIRTUAL_ACCOUNT_ISSUED", 120000), 120000)).toEqual({ ok: true, pending: true });
  });

  it("금액 불일치 → 거부 (위변조 방지)", () => {
    const r = isPaymentValid(make("PAID", 1000), 120000);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("AMOUNT_MISMATCH");
  });

  it("실패/취소 상태 → 거부", () => {
    expect(isPaymentValid(make("FAILED", 120000), 120000).ok).toBe(false);
    expect(isPaymentValid(make("CANCELLED", 120000), 120000).ok).toBe(false);
  });
});

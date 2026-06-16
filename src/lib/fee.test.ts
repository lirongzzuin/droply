import { describe, it, expect } from "vitest";
import { calcSettlement } from "./fee";

describe("calcSettlement", () => {
  it("PG 결제는 8% 수수료를 부과한다", () => {
    const s = calcSettlement(120000, "PG");
    expect(s.feePercent).toBe(8);
    expect(s.feeAmount).toBe(9600);
    expect(s.payoutAmount).toBe(110400);
  });

  it("직거래는 수수료 0, 전액 정산", () => {
    const s = calcSettlement(1450000, "DIRECT_TRANSFER");
    expect(s.feeAmount).toBe(0);
    expect(s.payoutAmount).toBe(1450000);
  });

  it("fee + payout 은 항상 amount 와 일치한다 (잔액 보존)", () => {
    for (const amt of [1, 999, 12345, 550000, 2450001]) {
      const s = calcSettlement(amt, "PG");
      expect(s.feeAmount + s.payoutAmount).toBe(Math.round(amt));
    }
  });

  it("수수료는 반올림된다", () => {
    // 12345 * 8% = 987.6 → 988
    expect(calcSettlement(12345, "PG").feeAmount).toBe(988);
  });

  it("커스텀 수수료율을 허용하고 0~100으로 클램프한다", () => {
    expect(calcSettlement(100000, "PG", 10).feeAmount).toBe(10000);
    expect(calcSettlement(100000, "PG", 150).feeAmount).toBe(100000);
    expect(calcSettlement(100000, "PG", -5).feeAmount).toBe(0);
  });

  it("음수/비정상 금액은 거부한다", () => {
    expect(() => calcSettlement(-1, "PG")).toThrow();
    expect(() => calcSettlement(NaN, "PG")).toThrow();
  });
});

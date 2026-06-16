import { PLATFORM_FEE_PERCENT } from "./constants";

export interface SettlementBreakdown {
  /** 거래 총액(구매자 결제액, 원) */
  amount: number;
  /** 적용 수수료율(%) */
  feePercent: number;
  /** 플랫폼 수수료(원, 반올림) */
  feeAmount: number;
  /** 판매자 정산 예정액(원) */
  payoutAmount: number;
}

/**
 * 정산 계산 — DROPLY 수익 모델의 단일 진실.
 * - PG 결제(정가·경매): 플랫폼 수수료 부과 (기본 8%)
 * - 직거래(계좌이체): 수수료 0 (플랫폼은 중개만)
 *
 * 정수(원) 기준으로 동작하며 수수료는 반올림, 정산액은 잔액으로 계산해
 * feeAmount + payoutAmount === amount 가 항상 성립한다.
 */
export function calcSettlement(
  amount: number,
  method: "PG" | "DIRECT_TRANSFER",
  feePercent: number = PLATFORM_FEE_PERCENT,
): SettlementBreakdown {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("amount must be a non-negative finite number");
  }
  const intAmount = Math.round(amount);

  if (method === "DIRECT_TRANSFER") {
    return { amount: intAmount, feePercent: 0, feeAmount: 0, payoutAmount: intAmount };
  }

  const safePercent = Math.max(0, Math.min(100, feePercent));
  const feeAmount = Math.round((intAmount * safePercent) / 100);
  const payoutAmount = intAmount - feeAmount;
  return { amount: intAmount, feePercent: safePercent, feeAmount, payoutAmount };
}

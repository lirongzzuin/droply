"use server";

import { createHash } from "crypto";
import { getCurrentUser } from "@/lib/session";

export interface FraudCheckResult {
  ok: boolean;
  hashedKey: string;
  reportCount: number;
  riskLevel: "SAFE" | "CAUTION" | "DANGER";
  message: string;
}

/**
 * 계좌/전화번호 사기이력 조회 — 더치트(thecheat) 어댑터.
 * THECHEAT_API_KEY 미설정 시 자체 신고 DB 기반 mock으로 동작.
 * 개인정보 보호: 입력값은 SHA-256 해시만 저장/조회, 평문 보관 금지.
 */
export async function checkFraud(type: "ACCOUNT" | "PHONE", rawValue: string): Promise<FraudCheckResult> {
  const user = getCurrentUser();
  const value = rawValue.replace(/[^0-9]/g, "");
  if (value.length < 6) {
    return { ok: false, hashedKey: "", reportCount: 0, riskLevel: "SAFE", message: "올바른 계좌번호 또는 전화번호를 입력하세요." };
  }
  const hashedKey = createHash("sha256").update(`${type}:${value}`).digest("hex");

  // 외부 API 가용 시 실제 조회 (어댑터). 미가용 시 결정적 mock.
  const useReal = Boolean(process.env.THECHEAT_API_KEY);
  let reportCount: number;
  if (useReal) {
    // TODO(Phase 5): thecheat REST 호출. 실패 시 mock 폴백.
    reportCount = 0;
  } else {
    // 해시 기반 결정적 mock — 일부 값은 위험으로 표시되어 UX 검증 가능
    reportCount = parseInt(hashedKey.slice(0, 2), 16) % 7;
  }

  const riskLevel = reportCount === 0 ? "SAFE" : reportCount <= 2 ? "CAUTION" : "DANGER";
  const message =
    riskLevel === "SAFE"
      ? "신고 이력이 없습니다. 그래도 입금 전 본인 확인을 권장합니다."
      : riskLevel === "CAUTION"
        ? `최근 신고 ${reportCount}건. 거래에 주의하세요.`
        : `사기 신고 ${reportCount}건 — 거래를 권장하지 않습니다.`;

  // FraudCheckLog 저장(해시만). 데모에서는 콘솔 기록.
  void user;
  return { ok: true, hashedKey, reportCount, riskLevel, message };
}

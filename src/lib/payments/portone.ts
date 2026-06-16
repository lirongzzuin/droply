import "server-only";

/**
 * PortOne V2 서버 검증 — 결제/본인인증 단건 조회.
 * 인증: Authorization: PortOne {API_SECRET}.  엔드포인트: https://api.portone.io
 * PORTONE_API_SECRET 미설정 시 isConfigured=false → 호출부에서 mock 폴백.
 */
const API = "https://api.portone.io";

export const isPortOneServerConfigured = () => Boolean(process.env.PORTONE_API_SECRET);

export interface PortOnePayment {
  status: string; // PAID | VIRTUAL_ACCOUNT_ISSUED | FAILED | CANCELLED | ...
  amount: { total: number };
  orderName?: string;
  customer?: { id?: string };
  channel?: { type?: string; pgProvider?: string };
}

async function call<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PORTONE_API_${res.status}:${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export function getPayment(paymentId: string): Promise<PortOnePayment> {
  return call<PortOnePayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export interface IdentityVerification {
  status: string; // VERIFIED | FAILED | READY
  verifiedCustomer?: { name?: string; phoneNumber?: string; ci?: string };
}

export function getIdentityVerification(id: string): Promise<IdentityVerification> {
  return call<IdentityVerification>(`/identity-verifications/${encodeURIComponent(id)}`);
}

/** 결제가 결제완료(또는 가상계좌 발급)인지 + 금액 일치 검증 */
export function isPaymentValid(payment: PortOnePayment, expectedAmount: number): { ok: boolean; pending: boolean; reason?: string } {
  if (payment.amount?.total !== expectedAmount) return { ok: false, pending: false, reason: "AMOUNT_MISMATCH" };
  if (payment.status === "PAID") return { ok: true, pending: false };
  if (payment.status === "VIRTUAL_ACCOUNT_ISSUED") return { ok: true, pending: true }; // 입금 대기
  return { ok: false, pending: false, reason: `STATUS_${payment.status}` };
}

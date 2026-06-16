import "server-only";

export interface PaymentApproval {
  approved: boolean;
  pgTxnId: string;
  raw?: unknown;
}

export const isTossConfigured = () => Boolean(process.env.TOSS_SECRET_KEY);

/**
 * 토스페이먼츠 결제 승인 — 어댑터.
 * TOSS_SECRET_KEY 미설정 시 mock 승인(pgTxnId 발급)으로 폴백한다.
 * 멱등키는 호출부(주문 서비스)에서 보장한다.
 */
export async function approvePayment(args: {
  amount: number;
  orderId: string;
  paymentKey?: string;
}): Promise<PaymentApproval> {
  if (!isTossConfigured()) {
    return { approved: true, pgTxnId: `mock_${args.orderId}` };
  }
  // 실제 승인 (Phase 2 운영): POST https://api.tosspayments.com/v1/payments/confirm
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: args.amount, orderId: args.orderId, paymentKey: args.paymentKey }),
  });
  const raw = await res.json();
  return { approved: res.ok, pgTxnId: (raw as { paymentKey?: string }).paymentKey ?? "", raw };
}

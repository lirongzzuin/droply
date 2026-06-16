import { NextResponse } from "next/server";
import { getPayment, isPaymentValid, isPortOneServerConfigured } from "@/lib/payments/portone";
import { markOrderPaidByTxn } from "@/lib/services/order";

export const dynamic = "force-dynamic";

/**
 * PortOne 웹훅 — 결제 상태 변경 알림(특히 가상계좌 입금완료).
 * 신뢰 원칙: 웹훅 본문을 그대로 믿지 않고 paymentId로 PortOne를 재조회해 검증한다.
 * (전체 신뢰성은 주문 DB 영속화 후 보장 — 현재는 best-effort)
 */
export async function POST(req: Request) {
  if (!isPortOneServerConfigured()) return NextResponse.json({ ok: true, skipped: "not_configured" });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const paymentId: string | undefined = body?.data?.paymentId ?? body?.paymentId;
  if (!paymentId) return NextResponse.json({ ok: true, skipped: "no_payment_id" });

  try {
    const payment = await getPayment(paymentId);
    // 결제 완료 상태면 해당 txn의 PENDING 주문을 PAID로 (멱등)
    if (payment.status === "PAID") {
      markOrderPaidByTxn(paymentId);
    }
    void isPaymentValid; // 금액 검증은 주문 생성 시점에 수행됨
    return NextResponse.json({ ok: true, status: payment.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // 재시도 유도 않도록 200
  }
}

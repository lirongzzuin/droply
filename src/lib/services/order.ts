import "server-only";
import { state, nextId, type OrderRecord } from "../server-state";
import { withIdempotency } from "../idempotency";
import { calcSettlement } from "../fee";
import { approvePayment } from "../payments/toss";
import { sendEmail } from "../email";
import { getArtwork } from "../data";
import { findPersona } from "../auth";
import { createNotification } from "./notifications";

export interface CreateOrderInput {
  artworkId: string;
  buyerId: string;
  buyerEmail?: string;
  method: "PG" | "DIRECT_TRANSFER";
  amount: number;
  idempotencyKey: string;
  paymentKey?: string;
  /** PortOne 등에서 이미 검증된 결제 — 제공 시 내부 mock 승인을 건너뛴다 */
  preVerified?: { txnId: string; pending?: boolean };
}

export interface CreateOrderResult {
  ok: boolean;
  message: string;
  order?: OrderRecord;
  replayed?: boolean;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { artworkId, buyerId, method, amount, idempotencyKey } = input;
  const artwork = await getArtwork(artworkId);
  if (!artwork) return { ok: false, message: "작품을 찾을 수 없습니다." };
  if (artwork.artist.id === buyerId) return { ok: false, message: "본인 작품은 구매할 수 없습니다." };
  if (method === "PG" && !artwork.allowPg) return { ok: false, message: "온라인 결제를 지원하지 않습니다." };
  if (method === "DIRECT_TRANSFER" && !artwork.allowDirect) return { ok: false, message: "직거래를 지원하지 않습니다." };

  const { result, replayed } = await withIdempotency(idempotencyKey, input, async () => {
    const settle = calcSettlement(amount, method);
    const orderId = nextId("ord");
    let status: OrderRecord["status"] = "PENDING";
    let pgTxnId: string | undefined;

    if (method === "PG") {
      if (input.preVerified) {
        // PortOne에서 결제 검증 완료 — 가상계좌 발급(입금대기)이면 PENDING 유지
        status = input.preVerified.pending ? "PENDING" : "PAID";
        pgTxnId = input.preVerified.txnId;
      } else {
        const approval = await approvePayment({ amount: settle.amount, orderId, paymentKey: input.paymentKey });
        if (!approval.approved) throw new Error("PAYMENT_DECLINED");
        status = "PAID";
        pgTxnId = approval.pgTxnId;
      }
    }

    const order: OrderRecord = {
      id: orderId,
      artworkId,
      artworkTitle: artwork.title,
      artworkImage: artwork.images[0],
      buyerId,
      sellerHandle: artwork.artist.handle,
      amount: settle.amount,
      feeAmount: settle.feeAmount,
      payoutAmount: settle.payoutAmount,
      method,
      status,
      idempotencyKey,
      pgTxnId,
      createdAt: new Date().toISOString(),
      reviewed: false,
    };
    state().orders.unshift(order);

    // 알림 + 사이드채널
    createNotification({
      userId: artwork.artist.id,
      type: "SOLD",
      title: method === "PG" ? "작품이 판매됐어요" : "직거래 주문이 들어왔어요",
      body: `‘${artwork.title}’ · 정산 예정 ${settle.payoutAmount.toLocaleString("ko-KR")}원`,
      link: `/art/${artworkId}`,
    });
    if (method === "PG") {
      createNotification({ userId: buyerId, type: "PAID", title: "결제가 완료됐어요", body: `‘${artwork.title}’ 구매 완료.`, link: "/me/orders" });
      void sendEmail({ to: input.buyerEmail ?? `${buyerId}@droply.demo`, subject: "[DROPLY] 결제 완료", html: `<p>${artwork.title} 결제가 완료되었습니다.</p>` });
    }
    return order;
  });

  return {
    ok: true,
    replayed,
    order: result,
    message: replayed ? "이미 처리된 주문입니다." : method === "PG" ? "결제가 완료되었습니다." : "직거래 주문이 생성되었습니다.",
  };
}

export function listMyOrders(userId: string): OrderRecord[] {
  return state().orders.filter((o) => o.buyerId === userId);
}

export function getOrder(orderId: string): OrderRecord | undefined {
  return state().orders.find((o) => o.id === orderId);
}

export function findOrderByTxn(txnId: string): OrderRecord | undefined {
  return state().orders.find((o) => o.pgTxnId === txnId);
}

/** 웹훅: 가상계좌 입금완료 등 사후 결제 반영 (PENDING→PAID, 멱등) */
export function markOrderPaidByTxn(txnId: string): boolean {
  const o = findOrderByTxn(txnId);
  if (!o) return false;
  if (o.status === "PENDING") o.status = "PAID";
  return true;
}

/** 구매자 수령 확정 → COMPLETED + 판매자 신뢰도 가산 */
export function completeOrder(orderId: string, userId: string): { ok: boolean; message: string } {
  const o = getOrder(orderId);
  if (!o || o.buyerId !== userId) return { ok: false, message: "주문을 찾을 수 없습니다." };
  if (o.status === "COMPLETED") return { ok: true, message: "이미 완료된 주문입니다." };
  o.status = "COMPLETED";
  const seller = findPersona(`u_${o.sellerHandle}`);
  bumpTrust(seller?.id ?? o.sellerHandle, 10);
  return { ok: true, message: "거래가 완료되었습니다. 리뷰를 남겨보세요." };
}

export function bumpTrust(key: string, delta: number) {
  const s = state();
  s.trustDelta.set(key, (s.trustDelta.get(key) ?? 0) + delta);
}

export function trustDeltaFor(key: string): number {
  return state().trustDelta.get(key) ?? 0;
}

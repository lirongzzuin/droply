"use server";

import { revalidatePath } from "next/cache";
import { getArtwork } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { createOrder, completeOrder, type CreateOrderResult } from "@/lib/services/order";
import { addReview } from "@/lib/services/moderation";

export interface PurchaseResult {
  ok: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  feeAmount?: number;
  method?: "PG" | "DIRECT_TRANSFER";
  replayed?: boolean;
}

/** 정가 즉시 구매 — 멱등 주문 + (토스 어댑터)결제 승인 + 정산 + 알림. */
export async function purchaseFixed(
  artworkId: string,
  idempotencyKey: string,
  method: "PG" | "DIRECT_TRANSFER" = "PG",
): Promise<PurchaseResult> {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  const artwork = await getArtwork(artworkId);
  if (!artwork || artwork.saleType !== "FIXED" || !artwork.fixedPrice)
    return { ok: false, message: "정가 판매 작품이 아닙니다." };

  const res: CreateOrderResult = await createOrder({
    artworkId,
    buyerId: user.id,
    method,
    amount: artwork.fixedPrice,
    idempotencyKey,
  });
  if (!res.ok || !res.order) return { ok: false, message: res.message };
  revalidatePath("/me/orders");
  return {
    ok: true,
    message: res.message,
    orderId: res.order.id,
    amount: res.order.amount,
    feeAmount: res.order.feeAmount,
    method: res.order.method,
    replayed: res.replayed,
  };
}

export async function completeOrderAction(orderId: string) {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  const r = completeOrder(orderId, user.id);
  revalidatePath("/me/orders");
  return r;
}

export async function reviewOrderAction(orderId: string, rating: number, comment: string) {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  const r = addReview({ orderId, reviewerId: user.id, rating, comment });
  revalidatePath("/me/orders");
  return r;
}

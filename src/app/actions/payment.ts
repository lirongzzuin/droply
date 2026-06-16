"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { getArtwork } from "@/lib/data";
import { createOrder } from "@/lib/services/order";
import { getPayment, getIdentityVerification, isPaymentValid, isPortOneServerConfigured } from "@/lib/payments/portone";

export interface ConfirmResult {
  ok: boolean;
  message: string;
  orderId?: string;
  pending?: boolean;
}

/**
 * PortOne 결제 확인 — 결제 후 클라이언트가 paymentId를 전달.
 * 서버에서 PortOne로 결제를 검증(금액·상태)하고 멱등 주문을 생성한다.
 * 멱등키 = paymentId (중복 확인/웹훅 동시 도착에도 1건만 생성).
 */
export async function confirmPayment(paymentId: string, artworkId: string): Promise<ConfirmResult> {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  const artwork = await getArtwork(artworkId);
  if (!artwork || artwork.saleType !== "FIXED" || !artwork.fixedPrice) return { ok: false, message: "구매할 수 없는 작품입니다." };

  if (!isPortOneServerConfigured()) {
    return { ok: false, message: "결제 서버 설정이 필요합니다 (PORTONE_API_SECRET)." };
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch {
    return { ok: false, message: "결제 정보를 조회하지 못했습니다." };
  }

  const v = isPaymentValid(payment, artwork.fixedPrice);
  if (!v.ok) return { ok: false, message: v.reason === "AMOUNT_MISMATCH" ? "결제 금액이 일치하지 않습니다." : "결제가 완료되지 않았습니다." };

  const res = await createOrder({
    artworkId,
    buyerId: user.id,
    method: "PG",
    amount: artwork.fixedPrice,
    idempotencyKey: paymentId,
    preVerified: { txnId: paymentId, pending: v.pending },
  });
  if (!res.ok || !res.order) return { ok: false, message: res.message };
  revalidatePath("/me/orders");
  return {
    ok: true,
    orderId: res.order.id,
    pending: v.pending,
    message: v.pending ? "가상계좌가 발급됐어요. 입금 완료 후 확정됩니다." : "결제가 완료되었습니다.",
  };
}

/** 다날 본인인증 확인 — identityVerificationId 검증 → 인증 배지 */
export async function confirmIdentity(identityVerificationId: string): Promise<{ ok: boolean; message: string }> {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  if (!isPortOneServerConfigured()) return { ok: false, message: "본인인증 서버 설정이 필요합니다." };
  try {
    const iv = await getIdentityVerification(identityVerificationId);
    if (iv.status !== "VERIFIED") return { ok: false, message: "본인인증이 완료되지 않았습니다." };
    // TODO(DB 인증 단계): user.isVerified=true 영속화. 현재는 검증 성공만 확인.
    return { ok: true, message: "본인인증이 완료됐어요. 신뢰 배지가 부여됩니다." };
  } catch {
    return { ok: false, message: "본인인증 정보를 조회하지 못했습니다." };
  }
}

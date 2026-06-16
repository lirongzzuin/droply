"use server";

import { getCurrentUser } from "@/lib/session";
import { placeBid, type BidResult } from "@/lib/services/auction";
import { rateLimit } from "@/lib/ratelimit";

export async function placeBidAction(artworkId: string, amount: number, idempotencyKey: string): Promise<BidResult> {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  const rl = await rateLimit(`bid:${user.id}`, 10, 10); // 10초당 10회
  if (!rl.ok) return { ok: false, message: "너무 빠르게 입찰하고 있어요. 잠시 후 다시 시도해 주세요." };
  return placeBid({
    artworkId,
    bidderId: user.id,
    bidderHandle: user.handle,
    bidderAvatar: user.avatarUrl,
    amount: Math.round(amount),
    idempotencyKey,
  });
}

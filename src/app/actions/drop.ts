"use server";

import { getCurrentUser } from "@/lib/session";
import { buyDrop, type BuyDropResult } from "@/lib/services/drop";

export async function buyDropAction(artworkId: string, idempotencyKey: string): Promise<BuyDropResult> {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  return buyDrop({ artworkId, userId: user.id, idempotencyKey });
}

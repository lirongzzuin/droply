"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { getArtwork } from "@/lib/data";
import { sendMessage, roomKey } from "@/lib/services/chat";
import { createReport } from "@/lib/services/moderation";

export async function sendMessageAction(artworkId: string, body: string) {
  const user = getCurrentUser();
  if (!user) return { ok: false as const, message: "로그인이 필요합니다." };
  const artwork = await getArtwork(artworkId);
  if (!artwork) return { ok: false as const, message: "작품을 찾을 수 없습니다." };
  const key = roomKey(artworkId, user.id);
  const msg = sendMessage({ key, senderId: user.id, sellerId: artwork.artist.id, body });
  revalidatePath(`/chat/${artworkId}`);
  return { ok: true as const, message: msg };
}

export async function reportAction(targetType: "ARTWORK" | "USER" | "CHAT", targetId: string, reason: string) {
  const user = getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  createReport({ targetType, targetId, reporterId: user.id, reason });
  return { ok: true, message: "신고가 접수됐어요. 검토 후 조치하겠습니다." };
}

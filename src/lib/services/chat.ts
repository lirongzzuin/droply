import "server-only";
import { state, nextId, type ChatMessageRecord } from "../server-state";
import { createNotification } from "./notifications";

export function roomKey(artworkId: string, buyerId: string) {
  return `${artworkId}:${buyerId}`;
}

const SEED = (key: string): ChatMessageRecord[] => [
  { id: `${key}-s1`, roomKey: key, senderId: "seller", body: "안녕하세요, 관심 가져주셔서 감사합니다. 지난 리미티드 드롭에서 직접 수령한 정품이에요. 실물 확인도 가능합니다.", createdAt: new Date(Date.now() - 9 * 60000).toISOString() },
];

export function getMessages(key: string): ChatMessageRecord[] {
  const s = state();
  if (!s.chats.has(key)) s.chats.set(key, SEED(key));
  return s.chats.get(key)!;
}

export function sendMessage(args: { key: string; senderId: string; sellerId: string; body?: string; imageUrl?: string }): ChatMessageRecord {
  const msg: ChatMessageRecord = {
    id: nextId("msg"),
    roomKey: args.key,
    senderId: args.senderId,
    body: args.body,
    imageUrl: args.imageUrl,
    createdAt: new Date().toISOString(),
  };
  getMessages(args.key).push(msg);
  if (args.sellerId && args.sellerId !== args.senderId) {
    createNotification({ userId: args.sellerId, type: "NEW_MESSAGE", title: "새 메시지", body: args.body?.slice(0, 40) ?? "이미지를 보냈어요", link: `/chat/${args.key.split(":")[0]}` });
  }
  return msg;
}

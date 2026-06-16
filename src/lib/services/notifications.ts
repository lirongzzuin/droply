import "server-only";
import { state, nextId, type NotificationRecord } from "../server-state";

type NewNotif = Omit<NotificationRecord, "id" | "read" | "createdAt">;

/** 알림 생성 (이벤트 발생 시). Web Push/이메일 발송은 dispatchSideChannels에서 처리. */
export function createNotification(n: NewNotif): NotificationRecord {
  const rec: NotificationRecord = {
    ...n,
    id: nextId("ntf"),
    read: false,
    createdAt: new Date().toISOString(),
  };
  state().notifications.unshift(rec);
  return rec;
}

export function listNotifications(userId: string): NotificationRecord[] {
  return state().notifications.filter((n) => n.userId === userId);
}

export function unreadCount(userId: string): number {
  return state().notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markAllRead(userId: string) {
  for (const n of state().notifications) if (n.userId === userId) n.read = true;
}

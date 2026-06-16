import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Icon } from "@/components/Icon";
import { getCurrentUser } from "@/lib/session";
import { listNotifications } from "@/lib/services/notifications";
import { markAllReadAction } from "@/app/actions/notifications";
import { PushOptIn } from "@/components/PushOptIn";
import { timeAgo, cn } from "@/lib/utils";

export const metadata = { title: "알림" };

const ICON: Record<string, string> = {
  OUTBID: "gavel",
  WON: "emoji_events",
  ENDING_SOON: "schedule",
  DROP_OPEN: "bolt",
  NEW_MESSAGE: "chat",
  PAID: "shopping_bag",
  SOLD: "sell",
  REVIEW: "star",
};

export default function NotificationsPage() {
  const user = getCurrentUser();
  if (!user) return <Gate />;
  const items = listNotifications(user.id);
  const hasUnread = items.some((n) => !n.read);

  return (
    <>
      <TopBar
        title="알림"
        actions={
          hasUnread ? (
            <form action={markAllReadAction}>
              <button className="font-mono text-label-caps text-acid-lime">모두 읽음</button>
            </form>
          ) : (
            <span />
          )
        }
      />
      <main className="pt-16 pb-24 px-container-margin">
        <PushOptIn />
        {items.length === 0 ? (
          <div className="py-16 text-center text-secondary">아직 알림이 없어요.</div>
        ) : (
          <div className="mt-stack-lg flex flex-col gap-3">
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                className={cn(
                  "flex gap-4 items-start p-4 border rounded-xl transition-colors",
                  n.read ? "bg-surface-container/40 border-outline-variant/40" : "bg-surface-container border-acid-lime/30",
                )}
              >
                <span className="w-10 h-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name={ICON[n.type] ?? "notifications"} className="text-acid-lime" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-on-surface">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-acid-lime" />}
                  </div>
                  <p className="text-secondary text-sm leading-snug">{n.body}</p>
                  <p className="text-[10px] text-secondary/60 font-mono mt-1 uppercase" suppressHydrationWarning>{timeAgo(n.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Gate() {
  return (
    <>
      <TopBar title="알림" actions={<span />} />
      <main className="pt-16 pb-24 px-container-margin">
        <div className="py-24 flex flex-col items-center text-center gap-4">
          <Icon name="notifications_off" className="text-5xl text-secondary" />
          <p className="text-secondary">로그인하면 입찰·드롭·메시지 알림을 받아볼 수 있어요.</p>
          <Link href="/login" className="bg-acid-lime text-black font-bold px-6 py-3 rounded-lg shadow-acid">로그인</Link>
        </div>
      </main>
    </>
  );
}

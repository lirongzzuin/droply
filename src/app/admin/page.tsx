import { redirect } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Icon } from "@/components/Icon";
import { getCurrentUser } from "@/lib/session";
import { listReports } from "@/lib/services/moderation";
import { resolveReportAction } from "@/app/actions/admin";
import { timeAgo, cn } from "@/lib/utils";

export const metadata = { title: "모더레이션" };

const STATUS = { OPEN: "대기", RESOLVED: "조치완료", DISMISSED: "반려" } as const;

export default function AdminPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  const reports = listReports();
  const open = reports.filter((r) => r.status === "OPEN").length;

  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      <TopBar variant="back" title="모더레이션" actions={<span />} />
      <main className="pt-16 pb-24 px-container-margin">
        <div className="mt-stack-lg mb-stack-md flex items-center justify-between">
          <h2 className="font-display text-headline-sm">신고 큐</h2>
          <span className="font-mono text-label-caps text-acid-lime bg-acid-lime/10 px-3 py-1 rounded-full">대기 {open}건</span>
        </div>

        {reports.length === 0 ? (
          <div className="py-24 text-center text-secondary flex flex-col items-center gap-3">
            <Icon name="verified_user" className="text-5xl" />
            처리할 신고가 없어요. 깨끗합니다 ✨
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <div key={r.id} className="p-4 bg-surface-container border border-outline-variant rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-label-caps text-secondary uppercase">{r.targetType}</span>
                    <p className="font-bold mt-1">{r.reason}</p>
                    <Link href={r.targetType === "ARTWORK" || r.targetType === "CHAT" ? `/art/${r.targetId}` : "#"} className="text-acid-lime text-sm font-mono">#{r.targetId}</Link>
                    <p className="text-[10px] text-secondary/60 font-mono mt-1" suppressHydrationWarning>{timeAgo(r.createdAt)}</p>
                  </div>
                  <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded uppercase", r.status === "OPEN" ? "bg-error/10 text-error" : "bg-surface-container-high text-secondary")}>
                    {STATUS[r.status]}
                  </span>
                </div>
                {r.status === "OPEN" && (
                  <div className="mt-3 pt-3 border-t border-outline-variant flex gap-2 justify-end">
                    <form action={resolveReportAction.bind(null, r.id, "DISMISSED")}>
                      <button className="px-4 py-2 rounded-lg border border-outline-variant text-secondary text-sm">반려</button>
                    </form>
                    <form action={resolveReportAction.bind(null, r.id, "RESOLVED")}>
                      <button className="px-4 py-2 rounded-lg bg-acid-lime text-black font-bold text-sm">조치 완료</button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

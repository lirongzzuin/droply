import { TopBar } from "@/components/TopBar";
import { LAST_UPDATED } from "@/lib/biz";

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      <TopBar variant="back" title={title} actions={<span />} />
      <main className="pt-16 pb-24 px-container-margin">
        <h1 className="font-display text-headline-md mt-stack-lg mb-1">{title}</h1>
        <p className="text-secondary text-xs font-mono mb-8">최종 개정일 {LAST_UPDATED} · 시행 전 법무 검토 권장</p>
        <div className="space-y-8 text-on-surface-variant leading-relaxed text-[15px]">{children}</div>
      </main>
    </div>
  );
}

export function Article({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-bold text-on-surface mb-2">
        제{no}조 ({title})
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="font-display text-headline-md">문제가 발생했어요</span>
      <p className="text-secondary">잠시 후 다시 시도해 주세요.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="bg-acid-lime text-black font-bold px-6 py-3 rounded-lg shadow-acid active:scale-95 transition-all">다시 시도</button>
        <Link href="/" className="px-6 py-3 rounded-lg border border-outline-variant text-primary">홈으로</Link>
      </div>
    </div>
  );
}

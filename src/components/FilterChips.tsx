"use client";

import Link from "next/link";
import { FEED_FILTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FilterChips({ active }: { active: string }) {
  return (
    <section className="sticky top-16 z-40 bg-background/80 glass border-b border-outline-variant/50">
      <div className="flex overflow-x-auto py-4 px-container-margin gap-3 no-scrollbar">
        {FEED_FILTERS.map((f) => {
          const on = f.key === active;
          return (
            <Link
              key={f.key}
              href={f.key === "trending" ? "/" : `/?f=${f.key}`}
              scroll={false}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-full font-mono text-label-caps transition-all active:scale-95",
                on
                  ? "bg-acid-lime text-black"
                  : "bg-surface-container text-on-surface border border-outline-variant",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

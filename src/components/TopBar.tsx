"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface TopBarProps {
  variant?: "home" | "back";
  title?: string;
  actions?: React.ReactNode;
  /** 스크롤 시 자동 숨김 (홈 피드용) */
  className?: string;
}

export function TopBar({ variant = "home", title, actions, className }: TopBarProps) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "fixed top-0 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 flex justify-between items-center px-container-margin h-16 bg-background/80 glass border-b border-outline-variant",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {variant === "back" ? (
          <button onClick={() => router.back()} className="text-primary active:scale-95 transition-transform" aria-label="뒤로">
            <Icon name="arrow_back" />
          </button>
        ) : null}
        <Link href="/" className="font-display text-headline-md font-extrabold tracking-tighter text-primary">
          {title ?? "DROPLY"}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {actions ?? (
          <Link href="/search" className="text-primary active:scale-95 transition-transform" aria-label="검색">
            <Icon name="search" />
          </Link>
        )}
      </div>
    </header>
  );
}

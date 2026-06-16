"use client";

import { useUI } from "@/store/ui";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/utils";

export function LikeButton({
  artworkId,
  baseCount,
  variant = "overlay",
}: {
  artworkId: string;
  baseCount: number;
  variant?: "overlay" | "outline";
}) {
  const liked = useUI((s) => s.liked[artworkId] ?? false);
  const toggle = useUI((s) => s.toggleLike);
  const count = baseCount + (liked ? 1 : 0);

  if (variant === "outline") {
    return (
      <button
        onClick={() => toggle(artworkId)}
        aria-pressed={liked}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container active:scale-90 transition-all"
      >
        <Icon name="favorite" fill={liked} className={cn(liked ? "text-acid-lime" : "text-primary")} />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => toggle(artworkId)}
        aria-pressed={liked}
        className="flex items-center justify-center p-2 rounded-full bg-white/10 glass active:scale-90 transition-transform"
      >
        <Icon name="favorite" fill={liked} className={cn(liked ? "text-acid-lime" : "text-white")} />
      </button>
      <span className="font-mono text-[12px] text-white" suppressHydrationWarning>
        {formatCount(count)}
      </span>
    </div>
  );
}

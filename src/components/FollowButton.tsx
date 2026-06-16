"use client";

import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export function FollowButton({ handle, size = "md" }: { handle: string; size?: "sm" | "md" }) {
  const following = useUI((s) => s.following[handle] ?? false);
  const toggle = useUI((s) => s.toggleFollow);
  return (
    <button
      onClick={() => toggle(handle)}
      aria-pressed={following}
      className={cn(
        "rounded-full font-bold transition-all active:scale-95",
        size === "sm" ? "px-5 py-2 text-sm" : "px-8 py-3",
        following
          ? "bg-surface-container text-secondary border border-outline-variant"
          : "border border-primary text-primary hover:bg-white hover:text-black",
      )}
      suppressHydrationWarning
    >
      {following ? "팔로잉" : "팔로우"}
    </button>
  );
}

export function WishlistButton({ artworkId }: { artworkId: string }) {
  const on = useUI((s) => s.wishlisted[artworkId] ?? false);
  const toggle = useUI((s) => s.toggleWishlist);
  return (
    <button
      onClick={() => toggle(artworkId)}
      aria-pressed={on}
      aria-label="위시리스트"
      className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container active:scale-90 transition-all"
    >
      <span
        className={cn("material-symbols-outlined", on ? "fill text-acid-on" : "text-primary")}
        aria-hidden
      >
        bookmark
      </span>
    </button>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/types";
import { formatKRW } from "@/lib/utils";
import { statusText } from "./SaleBadge";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

/** 작가 프로필 / 검색 그리드용 카드 */
export function ArtworkCard({ artwork, ratio = "aspect-[3/4]" }: { artwork: Artwork; ratio?: string }) {
  const liked = useUI((s) => s.liked[artwork.id] ?? false);
  const toggle = useUI((s) => s.toggleLike);
  const isLive = artwork.saleType === "AUCTION" && artwork.auction?.status === "LIVE";

  return (
    <div className="group relative">
      <Link href={`/art/${artwork.id}`}>
        <div className={cn("overflow-hidden bg-surface-container-low border border-outline-variant rounded-lg relative", ratio)}>
          <Image
            src={artwork.images[0]}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 50vw, 320px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {isLive && (
            <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-background/60 glass rounded-full">
              <span className="w-2 h-2 bg-acid-lime rounded-full animate-pulse-glow" />
              <span className="font-mono text-[10px] text-primary">LIVE</span>
            </span>
          )}
        </div>
      </Link>
      <div className="mt-3 flex justify-between items-start">
        <div className="min-w-0">
          <Link href={`/art/${artwork.id}`}>
            <h4 className="font-display text-sm tracking-tight truncate">{artwork.title}</h4>
          </Link>
          <p className="font-mono text-primary-fixed-dim text-sm">{formatKRW(artwork.displayPrice)}</p>
        </div>
        <button onClick={() => toggle(artwork.id)} aria-pressed={liked} aria-label="좋아요" className="shrink-0">
          <span className={cn("material-symbols-outlined transition-colors", liked ? "fill text-acid-on" : "text-secondary hover:text-error")} aria-hidden>
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}

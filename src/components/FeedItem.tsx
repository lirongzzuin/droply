import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/types";
import { formatKRW } from "@/lib/utils";
import { SaleBadge } from "./SaleBadge";
import { LikeButton } from "./LikeButton";
import { cn } from "@/lib/utils";

/** 인스타 감성 풀블리드 피드 아이템 */
export function FeedItem({ artwork, priority }: { artwork: Artwork; priority?: boolean }) {
  return (
    <article className="relative w-full aspect-[3/4] md:aspect-[16/10] group overflow-hidden border-b border-outline-variant">
      <Link href={`/art/${artwork.id}`} className="absolute inset-0 z-10" aria-label={artwork.title} />
      <Image
        src={artwork.images[0]}
        alt={artwork.title}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 672px"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <SaleBadge artwork={artwork} />
        <span className="bg-black/60 glass text-white px-3 py-1.5 rounded font-mono text-price-tag">
          {formatKRW(artwork.displayPrice)}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-container-margin z-20 flex justify-between items-end pointer-events-none">
        <Link href={`/@${artwork.artist.handle}`} className="flex items-center gap-3 pointer-events-auto">
          <span
            className={cn(
              "relative w-10 h-10 rounded-full overflow-hidden border-2",
              artwork.saleType === "AUCTION" ? "border-acid-lime" : "border-white/20",
            )}
          >
            <Image src={artwork.artist.avatarUrl} alt={artwork.artist.displayName} fill sizes="40px" className="object-cover" />
          </span>
          <span>
            <span className="block font-display text-[18px] text-white tracking-tight leading-tight">
              {artwork.artist.displayName}
            </span>
            <span className="block text-secondary text-[12px] font-mono uppercase">{artwork.title}</span>
          </span>
        </Link>
        <div className="pointer-events-auto">
          <LikeButton artworkId={artwork.id} baseCount={artwork.likeCount} />
        </div>
      </div>
    </article>
  );
}

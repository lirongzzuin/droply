import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArtist, getArtworksByArtist } from "@/lib/data";
import { TopBar } from "@/components/TopBar";
import { Icon } from "@/components/Icon";
import { FollowButton } from "@/components/FollowButton";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ShareButton } from "@/components/ShareButton";
import { reviewsForHandle } from "@/lib/services/moderation";
import { trustDeltaFor } from "@/lib/services/order";
import { formatCount } from "@/lib/utils";

function clean(h: string) {
  return decodeURIComponent(h).replace(/^@/, "");
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const artist = await getArtist(clean(params.handle));
  if (!artist) return { title: "작가를 찾을 수 없음" };
  return { title: `${artist.displayName} (@${artist.handle})`, description: artist.bio };
}

const TABS = [
  { key: "works", label: "작품" },
  { key: "sold", label: "판매완료" },
  { key: "drops", label: "드롭" },
];

export default async function ArtistProfile({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: { tab?: string };
}) {
  const handle = clean(params.handle);
  const artist = await getArtist(handle);
  if (!artist) notFound();
  const all = await getArtworksByArtist(handle);
  const tab = TABS.some((t) => t.key === searchParams.tab) ? searchParams.tab : "works";

  const items =
    tab === "drops" ? all.filter((a) => a.saleType === "DROP") : tab === "sold" ? all.filter((a) => a.status === "SOLD") : all;

  const ratios = ["aspect-[3/4]", "aspect-square", "aspect-square", "aspect-[4/5]"];

  const reviews = reviewsForHandle(artist.handle);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const effectiveTrust = artist.trustScore + trustDeltaFor(artist.handle);

  return (
    <>
      <TopBar
        variant="back"
        actions={<ShareButton title={artist.displayName} path={`/@${artist.handle}`} />}
      />

      <section className="relative pt-16">
        <div className="h-56 md:h-72 w-full overflow-hidden relative">
          {artist.coverUrl && (
            <Image src={artist.coverUrl} alt="" fill sizes="672px" className="object-cover grayscale brightness-50" priority />
          )}
        </div>

        <div className="px-container-margin -mt-16 relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="relative w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-surface-container">
              <Image src={artist.avatarUrl} alt={artist.displayName} fill sizes="128px" className="object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-headline-md font-extrabold tracking-tight uppercase">{artist.displayName}</h1>
                {artist.isVerified && <Icon name="verified" fill className="text-acid-on text-lg" />}
                {artist.isTopArtist && (
                  <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center gap-1">
                    <Icon name="workspace_premium" fill className="text-[12px]" />
                    <span className="font-mono text-[10px] uppercase">Top Artist</span>
                  </span>
                )}
              </div>
              <p className="text-secondary font-mono tracking-tight">@{artist.handle}</p>
            </div>
          </div>
          <div className="flex gap-4 md:pb-4">
            <FollowButton handle={artist.handle} />
            <button className="px-3 py-3 border border-outline-variant text-primary rounded-lg active:scale-95 transition-all">
              <Icon name="share" />
            </button>
          </div>
        </div>
      </section>

      <section className="px-container-margin mt-stack-lg">
        <div className="flex justify-between md:justify-start md:gap-12 py-6 border-y border-outline-variant">
          <Stat value={formatCount(artist.followerCount)} label="팔로워" />
          <Stat value={formatCount(artist.followingCount)} label="팔로잉" />
          <Stat value={String(artist.listedCount)} label="판매중" />
        </div>

        <div className="mt-stack-md flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant">
            <Icon name="shield" fill className="text-acid-on text-[16px]" />
            <span className="font-mono text-sm">신뢰도 {effectiveTrust}</span>
          </span>
          {reviews.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant">
              <Icon name="star" fill className="text-acid-on text-[16px]" />
              <span className="font-mono text-sm">{avgRating.toFixed(1)} · 리뷰 {reviews.length}</span>
            </span>
          )}
        </div>

        {artist.statement && (
          <div className="mt-8">
            <h3 className="font-mono text-secondary text-[12px] uppercase tracking-[0.2em] mb-4">작가 소개</h3>
            <p className="text-on-surface leading-relaxed">{artist.statement}</p>
          </div>
        )}

        {artist.socials && Object.keys(artist.socials).length > 0 && (
          <div className="mt-8">
            <h3 className="font-mono text-secondary text-[12px] uppercase tracking-[0.2em] mb-4">채널</h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(artist.socials).map(([k, v]) => (
                <span key={k} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant">
                  <Icon name="link" className="text-lg" />
                  <span className="font-mono text-sm capitalize">{k}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 탭 */}
      <nav className="sticky top-16 z-40 bg-background border-b border-outline-variant mt-stack-lg">
        <div className="px-container-margin flex gap-8">
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <Link
                key={t.key}
                href={`/@${artist.handle}${t.key === "works" ? "" : `?tab=${t.key}`}`}
                scroll={false}
                className={`relative py-4 font-mono text-sm ${on ? "text-primary" : "text-secondary"}`}
              >
                {t.label}
                {on && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary-fixed-dim" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="px-container-margin mt-stack-md pb-24">
        {items.length === 0 ? (
          <div className="py-24 text-center text-secondary">아직 작품이 없어요.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((a, i) => (
              <div key={a.id} className={i % 2 === 1 ? "mt-6" : ""}>
                <ArtworkCard artwork={a} ratio={ratios[i % ratios.length]} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-mono text-headline-md">{value}</p>
      <p className="font-mono text-secondary text-[11px] uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArtwork } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { TopBar } from "@/components/TopBar";
import { Carousel } from "@/components/Carousel";
import { Icon } from "@/components/Icon";
import { LikeButton } from "@/components/LikeButton";
import { WishlistButton } from "@/components/FollowButton";
import { FollowButton } from "@/components/FollowButton";
import { BuyBar } from "@/components/BuyBar";
import { CountdownText } from "@/components/Countdown";
import { ShareButton } from "@/components/ShareButton";
import { formatKRW } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const art = await getArtwork(params.id);
  if (!art) return { title: "작품을 찾을 수 없음" };
  return {
    title: art.title,
    description: art.description.slice(0, 120),
    openGraph: { title: `${art.title} · ${art.artist.displayName}`, images: [art.images[0]] },
  };
}

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const art = await getArtwork(params.id);
  if (!art) notFound();
  const user = getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      <TopBar
        variant="back"
        actions={
          <div className="flex gap-4 items-center">
            <ShareButton title={art.title} path={`/art/${art.id}`} />
          </div>
        }
      />

      <main className="pt-16 pb-32">
        <Carousel images={art.images} alt={art.title} />

        {/* 제목 / 에디션 */}
        <section className="px-container-margin mt-stack-lg">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              {art.edition && <p className="font-mono text-label-caps text-acid-lime uppercase">Edition {art.edition}</p>}
              <h1 className="font-display text-headline-md md:text-display-lg leading-tight uppercase">{art.title}</h1>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <LikeButton artworkId={art.id} baseCount={art.likeCount} variant="outline" />
              <WishlistButton artworkId={art.id} />
            </div>
          </div>

          {/* 작가 행 — Link와 팔로우 버튼은 형제 (중첩 시 이벤트 충돌) */}
          <div className="mt-8 p-4 bg-surface-container rounded-xl flex items-center justify-between border border-outline-variant">
            <Link href={`/@${art.artist.handle}`} className="flex items-center gap-4 min-w-0">
              <span className="relative w-12 h-12 rounded-full overflow-hidden border border-acid-lime/30 shrink-0">
                <Image src={art.artist.avatarUrl} alt={art.artist.displayName} fill sizes="48px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-on-surface truncate">{art.artist.displayName}</p>
                  {art.artist.isVerified && <Icon name="verified" fill className="text-acid-lime text-[16px]" />}
                </div>
                <p className="text-secondary text-sm">@{art.artist.handle}</p>
              </div>
            </Link>
            <FollowButton handle={art.artist.handle} size="sm" />
          </div>
        </section>

        {/* 설명 */}
        <section className="px-container-margin mt-section-gap space-y-stack-md">
          <h2 className="font-mono text-label-caps text-secondary uppercase border-b border-outline-variant pb-2">작품 설명</h2>
          <p className="text-on-surface-variant leading-relaxed">{art.description}</p>
          <div className="flex flex-wrap gap-2 pt-4">
            {art.tags.map((t) => (
              <Link key={t} href={`/search?q=${t}`} className="px-3 py-1 bg-surface-container-high rounded text-xs text-secondary border border-outline-variant">
                #{t}
              </Link>
            ))}
          </div>
        </section>

        {/* 거래 내역 / 가격 히스토리 */}
        {art.priceHistory && art.priceHistory.length > 0 && (
          <section className="px-container-margin mt-section-gap">
            <details className="group border-y border-outline-variant" open>
              <summary className="flex justify-between items-center py-6 cursor-pointer list-none">
                <span className="font-mono text-label-caps uppercase">거래 내역 / 가격 히스토리</span>
                <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-6 space-y-4">
                {art.priceHistory.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-lg">
                    <div className="flex gap-3 items-center">
                      <Icon name={h.kind === "SOLD" ? "shopping_cart" : h.kind === "LISTED" ? "sell" : "history"} className={h.kind === "SOLD" ? "text-acid-lime" : "text-secondary"} />
                      <div>
                        <p className="text-sm font-bold">{h.label}</p>
                        <p className="text-[10px] text-secondary uppercase">
                          {new Date(h.date).toLocaleDateString("ko-KR")}
                          {h.counterpartyHandle ? ` · @${h.counterpartyHandle}` : ""}
                        </p>
                      </div>
                    </div>
                    {h.amount ? <p className="font-mono text-on-surface">{formatKRW(h.amount)}</p> : <p className="text-xs text-secondary uppercase">Initial</p>}
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}

        {/* 스펙 벤토 */}
        {art.specs && (
          <section className="px-container-margin mt-section-gap">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {art.specs.format && <Spec label="Format" value={art.specs.format} />}
              {art.specs.colorSpace && <Spec label="Color Space" value={art.specs.colorSpace} />}
              {art.specs.resaleFee && <Spec label="Resale Fee" value={art.specs.resaleFee} />}
              {art.specs.security && <Spec label="Security" value={art.specs.security} />}
            </div>
          </section>
        )}
      </main>

      {/* 판매 방식별 스티키 CTA */}
      {art.saleType === "FIXED" ? (
        <BuyBar artwork={art} loggedIn={Boolean(user)} />
      ) : art.saleType === "AUCTION" ? (
        <StickyCta
          href={`/auction/${art.id}`}
          icon="gavel"
          label="입찰하러 가기"
          price={art.auction?.currentPrice}
          priceLabel="현재가"
        />
      ) : (
        <StickyCta
          href={`/drop/${art.id}`}
          icon="bolt"
          label="드롭 보기"
          extra={art.drop ? <CountdownText target={art.drop.dropAt} className="font-mono" /> : undefined}
        />
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border border-outline-variant rounded-xl flex flex-col gap-2">
      <span className="font-mono text-[10px] text-secondary uppercase">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function StickyCta({
  href,
  icon,
  label,
  price,
  priceLabel,
  extra,
}: {
  href: string;
  icon: string;
  label: string;
  price?: number;
  priceLabel?: string;
  extra?: React.ReactNode;
}) {
  return (
    <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 bg-background/90 glass border-t border-outline-variant p-container-margin">
      <div className="flex gap-4 items-center">
        <div className="flex flex-col">
          <span className="text-xs text-secondary uppercase font-mono">{priceLabel ?? "상태"}</span>
          <span className="font-mono text-xl text-primary">{price != null ? formatKRW(price) : extra}</span>
        </div>
        <Link href={href} className="flex-1 bg-acid-lime text-black py-4 rounded-lg font-bold text-lg shadow-acid active:scale-95 transition-all flex justify-center items-center gap-2">
          <Icon name={icon} fill />
          {label}
        </Link>
      </div>
    </footer>
  );
}

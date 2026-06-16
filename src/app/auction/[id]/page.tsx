import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtwork } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { getAuction, closeIfDue, toView } from "@/lib/services/auction";
import { TopBar } from "@/components/TopBar";
import { AuctionRoom } from "@/components/AuctionRoom";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const art = await getArtwork(params.id);
  return { title: art ? `${art.title} · 라이브 경매` : "경매" };
}

export default async function AuctionPage({ params }: { params: { id: string } }) {
  const art = await getArtwork(params.id);
  const a = closeIfDue(getAuction(params.id));
  if (!art || !a) notFound();
  const user = getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      <TopBar variant="back" actions={<span />} />
      <AuctionRoom
        artworkId={art.id}
        image={art.images[0]}
        title={art.title}
        likeCount={art.likeCount}
        viewerHandle={user?.handle ?? null}
        initial={toView(a)}
      />
    </div>
  );
}

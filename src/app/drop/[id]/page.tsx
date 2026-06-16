import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtwork } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { getDrop, toDropView } from "@/lib/services/drop";
import { TopBar } from "@/components/TopBar";
import { DropRoom } from "@/components/DropRoom";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const art = await getArtwork(params.id);
  return { title: art ? `${art.title} · 한정 드롭` : "드롭" };
}

export default async function DropPage({ params }: { params: { id: string } }) {
  const art = await getArtwork(params.id);
  const d = getDrop(params.id);
  if (!art || !d) notFound();
  const user = getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      <TopBar variant="back" actions={<span />} />
      <DropRoom
        artworkId={art.id}
        title={art.title}
        description={art.description}
        medium={art.medium}
        artistName={art.artist.displayName}
        heroImage={art.images[0]}
        detailImage={art.images[art.images.length - 1]}
        loggedIn={Boolean(user)}
        initial={toDropView(d)}
      />
    </div>
  );
}

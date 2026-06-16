import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getArtwork } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { getMessages, roomKey } from "@/lib/services/chat";
import { Icon } from "@/components/Icon";
import { ChatRoom } from "@/components/ChatRoom";

export const metadata = { title: "직거래 채팅" };

export default async function ChatPage({ params }: { params: { id: string } }) {
  const art = await getArtwork(params.id);
  if (!art) notFound();
  const user = getCurrentUser();
  if (!user) redirect("/login");
  const messages = getMessages(roomKey(art.id, user.id)).map((m) => ({ id: m.id, senderId: m.senderId, body: m.body, createdAt: m.createdAt }));

  return (
    <div className="mx-auto max-w-2xl h-[100dvh] flex flex-col">
      <header className="flex justify-between items-center px-container-margin h-16 bg-background border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/art/${art.id}`} className="text-primary active:scale-95 transition-transform"><Icon name="arrow_back" /></Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-display text-headline-sm text-primary">@{art.artist.handle}</span>
              {art.artist.isVerified && <Icon name="verified" fill className="text-acid-lime text-[16px]" />}
            </div>
            <span className="text-[10px] font-mono text-secondary tracking-widest">
              {art.artist.isVerified ? "TRUSTED SELLER" : "SELLER"} · 신뢰도 {art.artist.trustScore}
            </span>
          </div>
        </div>
        <button className="text-primary active:scale-95 transition-transform"><Icon name="more_vert" /></button>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatRoom artwork={art} peerHandle={art.artist.handle} viewerId={user.id} initialMessages={messages} />
      </main>
    </div>
  );
}

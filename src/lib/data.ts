import type { Artwork, Artist, FeedFilter, BidView } from "@/types";
import { countdownTo, isEndingSoon } from "./utils";
import { mockFeed, mockArtwork, mockArtist, mockByArtist, mockSearch, mockRelated } from "./data-mock";

/**
 * 데이터 접근 레이어 — DATABASE_URL 설정 시 Prisma(Neon), 미설정 시 mock 폴백.
 * 읽기 최적화: 피드/상세는 순수 조회. (쓰기·트랜잭션은 services/* 에서)
 */
export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);

// ──────────── Prisma 매핑 ────────────
const INCLUDE = {
  artist: {
    include: {
      artistProfile: true,
      _count: { select: { followers: true, following: true, artworks: true } },
    },
  },
  images: { orderBy: { position: "asc" as const } },
  auction: { include: { bids: { include: { bidder: true }, orderBy: { amount: "desc" as const } } } },
  drop: true,
};

function mapArtist(u: any): Artist {
  const p = u.artistProfile;
  return {
    id: u.id,
    handle: u.handle,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl ?? "",
    coverUrl: p?.coverUrl ?? undefined,
    bio: u.bio ?? undefined,
    statement: p?.statement ?? undefined,
    isVerified: u.isVerified,
    isTopArtist: p?.isTopArtist ?? false,
    trustScore: u.trustScore,
    socials: (p?.socials as Artist["socials"]) ?? undefined,
    followerCount: u._count?.followers ?? 0,
    followingCount: u._count?.following ?? 0,
    listedCount: u._count?.artworks ?? 0,
  };
}

function mapArtwork(a: any): Artwork {
  let auction: Artwork["auction"];
  if (a.auction) {
    const bids: BidView[] = a.auction.bids.map((b: any) => ({
      id: b.id,
      bidderHandle: b.bidder?.handle ?? "?",
      bidderAvatar: b.bidder?.avatarUrl ?? "",
      amount: b.amount,
      createdAt: b.createdAt.toISOString(),
    }));
    const currentPrice = bids.length ? bids[0].amount : a.auction.startPrice;
    auction = {
      startPrice: a.auction.startPrice,
      minIncrement: a.auction.minIncrement,
      reservePrice: a.auction.reservePrice ?? undefined,
      startsAt: a.auction.startsAt.toISOString(),
      endsAt: a.auction.endsAt.toISOString(),
      status: a.auction.status,
      bidCount: bids.length,
      currentPrice,
      highBidderHandle: bids[0]?.bidderHandle,
      antiSnipeSec: a.auction.antiSnipeSec,
      bids,
    };
  }
  const drop = a.drop
    ? {
        dropAt: a.drop.dropAt.toISOString(),
        totalStock: a.drop.totalStock,
        soldStock: a.drop.soldStock,
        perUserLimit: a.drop.perUserLimit,
      }
    : undefined;

  const displayPrice =
    a.saleType === "AUCTION" ? auction?.currentPrice : a.saleType === "FIXED" ? a.fixedPrice ?? undefined : a.fixedPrice ?? 120000;

  return {
    id: a.id,
    title: a.title,
    description: a.description,
    medium: a.medium,
    edition: a.edition ?? undefined,
    saleType: a.saleType,
    status: a.status,
    tags: a.tags,
    images: a.images.map((i: any) => i.url),
    fixedPrice: a.fixedPrice ?? undefined,
    allowPg: a.allowPg,
    allowDirect: a.allowDirect,
    likeCount: a.likeCount,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    artist: mapArtist(a.artist),
    auction,
    drop,
    displayPrice: displayPrice ?? undefined,
  };
}

async function allArtworks(): Promise<Artwork[]> {
  const { prisma } = await import("./db");
  const rows = await prisma.artwork.findMany({ where: { status: { not: "ARCHIVED" } }, include: INCLUDE });
  return rows.map(mapArtwork);
}

// ──────────── 공개 API ────────────
export async function getFeed(filter: FeedFilter = "trending"): Promise<Artwork[]> {
  if (!isDbConfigured()) return mockFeed(filter);
  const now = Date.now();
  let list = await allArtworks();
  switch (filter) {
    case "new":
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "ending":
      list = list
        .filter((a) => a.saleType === "AUCTION" && a.auction)
        .filter((a) => isEndingSoon(countdownTo(a.auction!.endsAt, now)))
        .sort((a, b) => +new Date(a.auction!.endsAt) - +new Date(b.auction!.endsAt));
      break;
    case "drops":
      list = list.filter((a) => a.saleType === "DROP" && a.drop).sort((a, b) => +new Date(a.drop!.dropAt) - +new Date(b.drop!.dropAt));
      break;
    case "following":
      list = list.filter((a) => a.artist.isVerified);
      break;
    default:
      list.sort((a, b) => b.likeCount + b.viewCount / 10 - (a.likeCount + a.viewCount / 10));
  }
  return list;
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  if (!isDbConfigured()) return mockArtwork(id);
  const { prisma } = await import("./db");
  const row = await prisma.artwork.findUnique({ where: { id }, include: INCLUDE });
  return row ? mapArtwork(row) : null;
}

export async function getArtist(handle: string): Promise<Artist | null> {
  if (!isDbConfigured()) return mockArtist(handle);
  const { prisma } = await import("./db");
  const u = await prisma.user.findUnique({
    where: { handle },
    include: { artistProfile: true, _count: { select: { followers: true, following: true, artworks: true } } },
  });
  return u ? mapArtist(u) : null;
}

export async function getArtworksByArtist(handle: string): Promise<Artwork[]> {
  if (!isDbConfigured()) return mockByArtist(handle);
  const { prisma } = await import("./db");
  const rows = await prisma.artwork.findMany({ where: { artist: { handle } }, include: INCLUDE, orderBy: { createdAt: "desc" } });
  return rows.map(mapArtwork);
}

export async function getLiveAuctions(): Promise<Artwork[]> {
  return (await getFeed("trending")).filter((a) => a.auction?.status === "LIVE");
}

export async function getUpcomingDrops(): Promise<Artwork[]> {
  return (await getFeed("drops"));
}

export async function searchArtworks(q: string): Promise<Artwork[]> {
  if (!isDbConfigured()) return mockSearch(q);
  const t = q.trim().toLowerCase();
  const list = await allArtworks();
  if (!t) return list;
  return list.filter(
    (a) =>
      a.title.toLowerCase().includes(t) ||
      a.artist.displayName.toLowerCase().includes(t) ||
      a.artist.handle.toLowerCase().includes(t) ||
      a.tags.some((x) => x.toLowerCase().includes(t)),
  );
}

export async function getRelated(artwork: Artwork): Promise<Artwork[]> {
  if (!isDbConfigured()) return mockRelated(artwork);
  const list = await allArtworks();
  return list
    .filter((a) => a.id !== artwork.id)
    .filter((a) => a.artist.id === artwork.artist.id || a.tags.some((t) => artwork.tags.includes(t)))
    .slice(0, 4);
}

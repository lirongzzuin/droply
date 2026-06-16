import type { Artwork, Artist, FeedFilter } from "@/types";
import { ARTWORKS, ARTISTS } from "./mock/data";
import { countdownTo, isEndingSoon } from "./utils";

/**
 * 데이터 접근 레이어 — 현재는 mock 소스.
 * DATABASE_URL 연결 시 이 함수들의 내부만 Prisma 쿼리로 교체하면 된다 (시그니처 유지).
 * 읽기 최적화 원칙: 피드/상세는 캐시 가능한 순수 조회.
 */

export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export async function getFeed(filter: FeedFilter = "trending"): Promise<Artwork[]> {
  const now = Date.now();
  let list = clone(ARTWORKS) as Artwork[];

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
      list = list
        .filter((a) => a.saleType === "DROP" && a.drop)
        .sort((a, b) => +new Date(a.drop!.dropAt) - +new Date(b.drop!.dropAt));
      break;
    case "following":
      // mock: 인증 작가만 노출 (실제로는 팔로우 그래프 조인)
      list = list.filter((a) => a.artist.isVerified);
      break;
    case "trending":
    default:
      list.sort((a, b) => b.likeCount + b.viewCount / 10 - (a.likeCount + a.viewCount / 10));
  }
  return list;
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  return (clone(ARTWORKS) as Artwork[]).find((a) => a.id === id) ?? null;
}

export async function getArtist(handle: string): Promise<Artist | null> {
  return (clone(ARTISTS) as Artist[]).find((a) => a.handle === handle) ?? null;
}

export async function getArtworksByArtist(handle: string): Promise<Artwork[]> {
  return (clone(ARTWORKS) as Artwork[]).filter((a) => a.artist.handle === handle);
}

export async function getLiveAuctions(): Promise<Artwork[]> {
  return (clone(ARTWORKS) as Artwork[]).filter((a) => a.auction?.status === "LIVE");
}

export async function getUpcomingDrops(): Promise<Artwork[]> {
  return (clone(ARTWORKS) as Artwork[])
    .filter((a) => a.saleType === "DROP" && a.drop)
    .sort((a, b) => +new Date(a.drop!.dropAt) - +new Date(b.drop!.dropAt));
}

export async function searchArtworks(q: string): Promise<Artwork[]> {
  const term = q.trim().toLowerCase();
  if (!term) return clone(ARTWORKS) as Artwork[];
  return (clone(ARTWORKS) as Artwork[]).filter(
    (a) =>
      a.title.toLowerCase().includes(term) ||
      a.artist.displayName.toLowerCase().includes(term) ||
      a.artist.handle.toLowerCase().includes(term) ||
      a.tags.some((t) => t.toLowerCase().includes(term)),
  );
}

export async function getRelated(artwork: Artwork): Promise<Artwork[]> {
  return (clone(ARTWORKS) as Artwork[])
    .filter((a) => a.id !== artwork.id)
    .filter((a) => a.artist.id === artwork.artist.id || a.tags.some((t) => artwork.tags.includes(t)))
    .slice(0, 4);
}

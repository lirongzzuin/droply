import type { Artwork, Artist, FeedFilter } from "@/types";
import { ARTWORKS, ARTISTS } from "./mock/data";
import { countdownTo, isEndingSoon } from "./utils";

/** mock 데이터 소스 — DATABASE_URL 미설정 시 폴백(로컬 zero-config/테스트). */

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function mockFeed(filter: FeedFilter, now = Date.now()): Artwork[] {
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

export const mockArtwork = (id: string) => (clone(ARTWORKS) as Artwork[]).find((a) => a.id === id) ?? null;
export const mockArtist = (handle: string) => (clone(ARTISTS) as Artist[]).find((a) => a.handle === handle) ?? null;
export const mockByArtist = (handle: string) => (clone(ARTWORKS) as Artwork[]).filter((a) => a.artist.handle === handle);
export const mockSearch = (term: string) => {
  const t = term.trim().toLowerCase();
  if (!t) return clone(ARTWORKS) as Artwork[];
  return (clone(ARTWORKS) as Artwork[]).filter(
    (a) =>
      a.title.toLowerCase().includes(t) ||
      a.artist.displayName.toLowerCase().includes(t) ||
      a.artist.handle.toLowerCase().includes(t) ||
      a.tags.some((x) => x.toLowerCase().includes(t)),
  );
};
export const mockRelated = (art: Artwork) =>
  (clone(ARTWORKS) as Artwork[])
    .filter((a) => a.id !== art.id)
    .filter((a) => a.artist.id === art.artist.id || a.tags.some((t) => art.tags.includes(t)))
    .slice(0, 4);

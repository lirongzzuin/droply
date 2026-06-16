import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/TopBar";
import { FilterChips } from "@/components/FilterChips";
import { FeedItem } from "@/components/FeedItem";
import { Icon } from "@/components/Icon";
import { getFeed } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import type { FeedFilter } from "@/types";

const VALID: FeedFilter[] = ["trending", "new", "ending", "drops", "following"];

export default async function HomePage({ searchParams }: { searchParams: { f?: string } }) {
  const filter = (VALID.includes(searchParams.f as FeedFilter) ? searchParams.f : "trending") as FeedFilter;
  const [feed, user] = await Promise.all([getFeed(filter), Promise.resolve(getCurrentUser())]);

  return (
    <>
      <TopBar
        actions={
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-primary active:scale-95 transition-transform" aria-label="검색">
              <Icon name="search" />
            </Link>
            {user ? (
              <Link href="/me" className="relative w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                <Image src={user.avatarUrl} alt={user.displayName} fill sizes="32px" className="object-cover" />
              </Link>
            ) : (
              <Link href="/login" className="font-mono text-label-caps text-black bg-acid-lime px-3 py-1.5 rounded-full">
                로그인
              </Link>
            )}
          </div>
        }
      />
      <main className="pt-16 pb-24">
        <FilterChips active={filter} />
        {feed.length === 0 ? (
          <div className="px-container-margin py-24 text-center text-secondary">
            <Icon name="filter_alt_off" className="text-4xl mb-3 block" />
            해당 조건의 작품이 아직 없어요.
          </div>
        ) : (
          <div className="flex flex-col">
            {feed.map((art, i) => (
              <FeedItem key={art.id} artwork={art} priority={i === 0} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

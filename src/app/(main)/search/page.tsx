import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Icon } from "@/components/Icon";
import { ArtworkCard } from "@/components/ArtworkCard";
import { searchArtworks } from "@/lib/data";
import { SUGGESTED_TAGS } from "@/lib/constants";

export const metadata = { title: "검색" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
  const results = q ? await searchArtworks(q) : [];

  return (
    <>
      <TopBar variant="back" actions={<span />} />
      <main className="pt-16 pb-24 px-container-margin">
        <form action="/search" className="mt-stack-lg relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="작가 · 작품 · 태그 검색"
            className="w-full bg-surface-container border border-outline-variant rounded-full py-3.5 pl-12 pr-4 text-primary placeholder:text-secondary/60 focus:ring-1 focus:ring-acid-lime focus:border-acid-lime outline-none"
          />
        </form>

        {!q && (
          <div className="mt-stack-lg">
            <h3 className="font-mono text-label-caps text-secondary uppercase mb-3">추천 무드</h3>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((t) => (
                <Link key={t} href={`/search?q=${t}`} className="px-4 py-2 rounded-full bg-surface-container border border-outline-variant font-mono text-sm hover:border-acid-lime transition-colors">
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {q && (
          <>
            <p className="mt-stack-lg mb-stack-md text-secondary text-sm">
              <span className="text-primary font-bold">‘{q}’</span> 검색 결과 {results.length}건
            </p>
            {results.length === 0 ? (
              <div className="py-20 text-center text-secondary">결과가 없어요.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map((a) => (
                  <ArtworkCard key={a.id} artwork={a} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

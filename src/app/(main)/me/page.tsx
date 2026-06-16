import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Icon } from "@/components/Icon";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/app/actions/auth";

export const metadata = { title: "내 프로필" };

const MENU = [
  { icon: "receipt_long", label: "주문 내역", href: "/me/orders" },
  { icon: "favorite", label: "좋아요·위시리스트", href: "/?f=trending" },
  { icon: "sell", label: "내 작품 관리", href: "/new" },
  { icon: "gavel", label: "모더레이션 (어드민)", href: "/admin" },
  { icon: "settings", label: "설정", href: "/me" },
];

export default function MePage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <TopBar title="내 프로필" actions={<span />} />
      <main className="pt-16 pb-24 px-container-margin">
        <section className="mt-stack-lg flex items-center gap-4">
          <span className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-acid-lime/30">
            <Image src={user.avatarUrl} alt={user.displayName} fill sizes="80px" className="object-cover" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-headline-sm">{user.displayName}</h1>
              {user.isVerified && <Icon name="verified" fill className="text-acid-lime text-[18px]" />}
            </div>
            <p className="text-secondary font-mono text-sm">@{user.handle}</p>
            <div className="flex items-center gap-1 mt-1">
              <Icon name="shield" className="text-[14px] text-acid-lime" />
              <span className="font-mono text-[11px] text-secondary">신뢰도 {user.trustScore}</span>
            </div>
          </div>
        </section>

        {!user.isArtist && (
          <Link href="/new" className="mt-stack-lg flex items-center justify-between p-4 bg-acid-lime/5 border border-acid-lime/20 rounded-xl">
            <div>
              <p className="font-bold text-acid-lime">작가로 시작하기</p>
              <p className="text-secondary text-sm">작품을 등록하고 판매를 시작하세요.</p>
            </div>
            <Icon name="arrow_forward" className="text-acid-lime" />
          </Link>
        )}

        <nav className="mt-stack-lg flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
          {MENU.map((m) => (
            <Link key={m.label} href={m.href} className="flex items-center gap-4 py-4 active:bg-surface-container transition-colors">
              <Icon name={m.icon} className="text-secondary" />
              <span className="flex-1">{m.label}</span>
              <Icon name="chevron_right" className="text-secondary" />
            </Link>
          ))}
        </nav>

        <Link href={`/@${user.handle}`} className="mt-stack-lg block text-center py-3 rounded-lg border border-outline-variant text-primary active:scale-95 transition-all">
          내 공개 프로필 보기
        </Link>

        <form action={logout} className="mt-3">
          <button className="w-full py-3 rounded-lg text-error active:scale-95 transition-all">로그아웃</button>
        </form>
      </main>
    </>
  );
}

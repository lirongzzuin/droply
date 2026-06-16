import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { getAvailableProviders, isAnyOAuthConfigured, DEV_PERSONAS } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { devLogin, startOAuth } from "@/app/actions/auth";

export const metadata = { title: "로그인" };

export default function LoginPage() {
  if (getCurrentUser()) redirect("/");
  const providers = getAvailableProviders();
  const anyOAuth = isAnyOAuthConfigured();

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-md mx-auto px-container-margin py-12">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-primary"><Icon name="close" /></Link>
        <span className="font-display text-headline-md font-extrabold tracking-tighter">DROPLY</span>
        <span className="w-6" />
      </header>

      <div className="space-y-3 my-8">
        <h1 className="font-display text-display-lg leading-[0.95] uppercase">
          발견하고,<br />드롭하고,<br /><span className="text-acid-on">소장하세요.</span>
        </h1>
        <p className="text-secondary">신진 작가와 Gen Z 컬렉터의 힙한 아트 플랫폼.</p>
      </div>

      <div className="space-y-3">
        {/* 설정된 OAuth provider만 노출 */}
        {providers.filter((p) => p.configured).map((p) => (
          <form key={p.id} action={startOAuth}>
            <input type="hidden" name="provider" value={p.id} />
            <button className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${p.brandClass}`}>
              {p.label}
            </button>
          </form>
        ))}

        {!anyOAuth && (
          <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
            <p className="font-mono text-label-caps text-acid-on uppercase mb-1">DEV MODE</p>
            <p className="text-secondary text-sm mb-4">
              소셜 로그인 키가 설정되지 않아 개발용 로그인을 노출합니다. (.env에 KAKAO/GOOGLE/APPLE 키 설정 시 자동 전환)
            </p>
            <div className="flex flex-col gap-2">
              {DEV_PERSONAS.map((p) => (
                <form key={p.id} action={devLogin}>
                  <input type="hidden" name="userId" value={p.id} />
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-container-high border border-outline-variant hover:border-acid-lime transition-colors active:scale-95">
                    <span className="relative w-9 h-9 rounded-full overflow-hidden">
                      <Image src={p.avatarUrl} alt={p.displayName} fill sizes="36px" className="object-cover" />
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-bold">{p.displayName}</span>
                      <span className="block text-xs text-secondary">@{p.handle}{p.isArtist ? " · 작가" : " · 컬렉터"}</span>
                    </span>
                    <Icon name="login" className="ml-auto text-secondary" />
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-secondary/60 mt-8">
        계속 진행하면 DROPLY의 <span className="underline">이용약관</span> 및 <span className="underline">개인정보 처리방침</span>에 동의하게 됩니다.
      </p>
    </div>
  );
}

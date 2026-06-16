import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "프로필 설정" };

/** @handle 강제 온보딩 — 데모에서는 페르소나 핸들을 표시하고 확인만 받는다. */
export default function Onboarding({ searchParams }: { searchParams: { via?: string } }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen max-w-md mx-auto px-container-margin py-12 flex flex-col">
      <div className="flex items-center gap-2 text-acid-lime">
        <Icon name="check_circle" fill />
        <span className="font-mono text-label-caps uppercase">
          {searchParams.via ? `${searchParams.via} 연결 완료` : "환영합니다"}
        </span>
      </div>

      <h1 className="font-display text-display-lg leading-tight uppercase mt-6">
        프로필<br />핸들 설정
      </h1>
      <p className="text-secondary mt-3">인스타 감성의 고유 주소가 됩니다. <span className="text-primary font-mono">droply.app/@{user.handle}</span></p>

      <div className="mt-8">
        <label className="font-mono text-label-caps text-secondary uppercase mb-2 block">@handle</label>
        <div className="flex items-center border-b border-acid-lime py-3">
          <span className="text-secondary font-mono text-lg mr-1">@</span>
          <input
            defaultValue={user.handle}
            className="bg-transparent border-0 outline-none text-lg font-mono text-primary w-full"
          />
          <Icon name="check" className="text-acid-lime" />
        </div>
        <p className="text-secondary text-xs mt-2">영문 소문자/숫자/언더스코어, 3~20자.</p>
      </div>

      <div className="mt-auto pt-8">
        <Link href="/" className="w-full bg-acid-lime text-black py-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-acid active:scale-95 transition-all">
          DROPLY 시작하기 <Icon name="arrow_forward" fill />
        </Link>
      </div>
    </div>
  );
}

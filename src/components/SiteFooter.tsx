import Link from "next/link";
import { BIZ } from "@/lib/biz";

/** 사업자 정보 푸터 — 전자상거래법 표시 의무 + 정책 링크 + 중개자 고지 */
export function SiteFooter() {
  return (
    <footer className="mt-section-gap border-t border-outline-variant px-container-margin py-8 text-secondary">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-display text-headline-sm tracking-tighter text-primary">DROPLY</span>
        <span className="text-[11px] font-mono">소셜 아트 드롭</span>
      </div>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-5">
        <Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link>
        <Link href="/privacy" className="hover:text-primary transition-colors font-medium text-on-surface-variant">개인정보처리방침</Link>
        <Link href="/refund" className="hover:text-primary transition-colors">청약철회·환불</Link>
        <a href={`mailto:${BIZ.email}`} className="hover:text-primary transition-colors">고객센터</a>
      </nav>

      <div className="space-y-1 text-[11px] leading-relaxed font-mono">
        <p>{BIZ.name} · 대표 {BIZ.owner}</p>
        <p>사업자등록번호 {BIZ.regNo} · 통신판매업신고 {BIZ.mailOrderNo}</p>
        <p>{BIZ.address}</p>
        <p>고객센터 {BIZ.tel} · {BIZ.email}</p>
        <p>호스팅 제공: {BIZ.host}</p>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed">
        DROPLY는 통신판매중개자이며, 작가·구매자 간 거래의 당사자가 아닙니다. 작품 정보·거래·배송의 책임은 판매자에게 있습니다.
        특히 채팅 직거래(계좌이체)는 당사자 간 거래로, 플랫폼은 결제·정산에 관여하지 않습니다.
      </p>
      <p className="mt-3 text-[11px]">© {new Date().getFullYear()} {BIZ.name}. All rights reserved.</p>
    </footer>
  );
}

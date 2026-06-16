import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="font-display text-display-xl text-acid-on tracking-tighter">404</span>
      <p className="text-secondary">찾는 페이지가 드롭되지 않았어요.</p>
      <Link href="/" className="flex items-center gap-2 bg-acid-lime text-black font-bold px-6 py-3 rounded-lg shadow-acid active:scale-95 transition-all">
        <Icon name="explore" fill /> 둘러보기로
      </Link>
    </div>
  );
}

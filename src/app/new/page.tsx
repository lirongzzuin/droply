import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { UploadWizard } from "@/components/UploadWizard";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "작품 등록" };

export default function NewArtworkPage() {
  if (!getCurrentUser()) redirect("/login");
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 flex justify-between items-center px-container-margin h-16 bg-background border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-primary active:scale-95 transition-transform"><Icon name="close" /></Link>
          <span className="font-display text-headline-md font-extrabold tracking-tighter">DROPLY</span>
        </div>
      </header>
      <main className="pt-24 pb-32 px-container-margin max-w-2xl mx-auto">
        <UploadWizard />
      </main>
    </div>
  );
}

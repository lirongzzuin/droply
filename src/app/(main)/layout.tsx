import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      {children}
      <div className="pb-24">
        <SiteFooter />
      </div>
      <BottomNav />
    </div>
  );
}

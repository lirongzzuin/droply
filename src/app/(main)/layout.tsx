import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}

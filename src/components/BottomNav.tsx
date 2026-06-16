"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 flex justify-around items-center px-4 py-3 bg-background/80 glass border-t border-outline-variant">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-200 active:scale-105",
              active ? "text-primary-fixed scale-110" : "text-secondary hover:text-primary",
            )}
          >
            <Icon
              name={item.icon}
              fill={active && !item.accent}
              className={cn(item.accent && "text-[32px] text-acid-lime")}
            />
            <span className={cn("font-mono text-[10px] mt-1", item.accent && "mt-0.5")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

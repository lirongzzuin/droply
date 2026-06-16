"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "system", label: "시스템", icon: "brightness_auto" },
  { value: "light", label: "라이트", icon: "light_mode" },
  { value: "dark", label: "다크", icon: "dark_mode" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // 마운트 후 저장값 반영 (하이드레이션 불일치 방지)
  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  // 시스템 모드일 때 OS 테마 변경에 실시간 반응
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function pick(t: Theme) {
    setTheme(t);
    applyTheme(t);
  }

  return (
    <div className="inline-flex p-1 rounded-full bg-surface-container-high border border-outline-variant" role="radiogroup" aria-label="테마 설정">
      {OPTIONS.map((o) => {
        const active = mounted && theme === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => pick(o.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono transition-all active:scale-95",
              active ? "bg-acid-lime text-black" : "text-secondary hover:text-primary",
            )}
          >
            <Icon name={o.icon} fill={active} className="text-[18px]" />
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

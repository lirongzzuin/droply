export type Theme = "system" | "light" | "dark";
export const THEME_KEY = "droply-theme";

export function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveIsDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark());
}

/** 테마 적용 — localStorage 저장 + <html>.dark 토글 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* noop */
  }
  document.documentElement.classList.toggle("dark", resolveIsDark(theme));
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const t = localStorage.getItem(THEME_KEY) as Theme | null;
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    /* noop */
  }
  return "system";
}

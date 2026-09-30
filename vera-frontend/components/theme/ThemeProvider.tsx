"use client";

import * as React from "react";
import type { ResolvedTheme, ThemeMode } from "@/lib/design-system/theme-types";
import { THEME_STORAGE_KEY } from "@/lib/design-system/theme-types";
import { resolveThemeMode } from "@/lib/design-system/tokens/theme";

export type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "light";
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeProvider({
  children,
  defaultMode = "light",
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}) {
  const [mode, setModeState] = React.useState<ThemeMode>(defaultMode);
  const [resolved, setResolved] = React.useState<ResolvedTheme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setModeState(readStoredMode());
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const next = resolveThemeMode(mode);
    setResolved(next);
    applyTheme(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode, mounted]);

  React.useEffect(() => {
    if (!mounted || mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = mq.matches ? "dark" : "light";
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, mounted]);

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggle = React.useCallback(() => {
    setModeState((prev) => {
      const current = resolveThemeMode(prev);
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  const value = React.useMemo(
    () => ({ mode, resolved, setMode, toggle }),
    [mode, resolved, setMode, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

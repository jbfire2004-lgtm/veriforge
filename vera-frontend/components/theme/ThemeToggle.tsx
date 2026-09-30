"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import type { ThemeMode } from "@/lib/design-system/theme-types";

export type ThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function ThemeToggle({ className, showLabel }: ThemeToggleProps) {
  const { resolved, setMode, mode } = useTheme();

  function cycle() {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const idx = order.indexOf(mode);
    setMode(order[(idx + 1) % order.length]!);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={cycle}
      aria-label={`Theme: ${mode}. Click to change.`}
    >
      {resolved === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
      {showLabel ? (
        <span className="capitalize">{mode}</span>
      ) : null}
    </Button>
  );
}

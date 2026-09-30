import type { ThemeMode } from "../theme-types";

export type SemanticTheme = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  ring: string;
  ringOffset: string;
};

export const lightSemantic: SemanticTheme = {
  background: "var(--color-gray-50)",
  foreground: "var(--color-gray-800)",
  muted: "var(--color-gray-100)",
  mutedForeground: "var(--color-gray-500)",
  surface: "var(--color-surface)",
  surfaceAlt: "var(--color-surface-alt)",
  border: "var(--color-border)",
  ring: "var(--color-primary)",
  ringOffset: "var(--color-surface)",
};

export const darkSemantic: SemanticTheme = {
  background: "var(--color-dark-bg)",
  foreground: "var(--color-dark-text)",
  muted: "var(--color-dark-surface)",
  mutedForeground: "var(--color-gray-400)",
  surface: "var(--color-dark-surface)",
  surfaceAlt: "var(--color-dark-bg)",
  border: "var(--color-dark-border)",
  ring: "var(--color-primary-light)",
  ringOffset: "var(--color-dark-bg)",
};

export function resolveThemeMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

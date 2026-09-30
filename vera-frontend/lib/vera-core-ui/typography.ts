/** Vera Core UI typography scale — mobile-first, Notion-clean. */
export const veraType = {
  display: "text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--foreground)]",
  title: "text-xl sm:text-2xl font-semibold tracking-tight text-[var(--foreground)]",
  heading: "text-lg font-semibold tracking-tight text-[var(--foreground)]",
  subheading: "text-sm font-medium text-[var(--foreground)]",
  body: "text-sm leading-relaxed text-[var(--foreground)]",
  caption: "text-xs leading-relaxed text-[var(--muted-foreground)]",
  eyebrow:
    "text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]",
  metric: "text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]",
  mono: "font-mono text-xs text-[var(--muted-foreground)]",
} as const;

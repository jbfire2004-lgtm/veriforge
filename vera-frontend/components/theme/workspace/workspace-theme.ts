/** Shared VERA workspace palette — industrial safety via CSS variables. */
export const WORKSPACE = {
  pageBg: "bg-[var(--background)]",
  pageBgGradient: "vera-shell-bg",
  heroGradient: "vera-hero-bg",
  heroGradientWelcome: "vera-hero-bg",
  textDeep: "text-[var(--foreground)]",
  textMuted: "text-[var(--muted-foreground)]",
  textBody: "text-[var(--foreground)]",
  teal: "text-[var(--compliance-ok)]",
  sectionPanel:
    "rounded-[6px] border border-[var(--card-border)] bg-[var(--card-bg)] shadow-none",
} as const;

export const WORKSPACE_RADIAL_OVERLAY = {
  backgroundImage:
    "radial-gradient(circle at 20% 20%, rgba(244,246,248,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(30,111,184,0.18) 0%, transparent 40%)",
} as const;

export const WORKSPACE_GRID_OVERLAY = {
  backgroundImage:
    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
  backgroundSize: "40px 40px",
} as const;

export const WORKSPACE_SECTION_GRID = {
  backgroundImage:
    "linear-gradient(#2A2E33 1px, transparent 1px), linear-gradient(90deg, #2A2E33 1px, transparent 1px)",
  backgroundSize: "32px 32px",
} as const;

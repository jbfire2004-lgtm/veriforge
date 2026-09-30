/**
 * Unified VeriForge surface / chrome classes — industrial safety dashboard.
 * Use these across cards, panels, tables, and forms for visual consistency.
 */

export const vfSurface = {
  /** Page / shell canvas */
  canvas: "bg-[#1C1F24] text-[#F4F6F8]",
  /** Default card / panel */
  panel: "rounded-[3px] border border-[#5A6169] bg-[#2A2E33] shadow-none",
  /** Elevated / nested panel */
  elevated: "rounded-[3px] border border-[#5A6169] bg-[#3B3F45] shadow-none",
  /** Quiet inset well */
  inset: "rounded-[3px] border border-[#5A6169]/80 bg-[#23272C] shadow-none",
  /** Warning surface (amber, not red) */
  warning:
    "rounded-[3px] border border-[#C89F3D]/70 bg-[#2A2820] shadow-none",
  /** Critical alert surface only — never for routine UI */
  critical:
    "rounded-[3px] border border-[#B33A3A]/70 bg-[#2A2224] shadow-none",
  /** Success surface */
  success:
    "rounded-[3px] border border-[#4FAF6F]/60 bg-[#1F2A24] shadow-none",
} as const;

export const vfHeader = {
  section:
    "flex items-start gap-3 border-b border-[#5A6169]/70 pb-3",
  title:
    "font-[var(--vf-font-heading)] text-sm font-semibold tracking-tight text-[#F4F6F8]",
  subtitle: "mt-0.5 text-sm leading-relaxed text-[#A8B0B8]",
  eyebrow:
    "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]",
  iconTile:
    "grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-[#5A6169] bg-[#23272C] text-[#1E6FB8]",
} as const;

export const vfTable = {
  wrap: "overflow-auto rounded-[3px] border border-[#5A6169]",
  table: "min-w-full border-collapse text-left text-sm text-[#F4F6F8]",
  thead: "bg-[#3B3F45]",
  th: "border-b border-[#5A6169] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#C5CCD3]",
  sortBtn:
    "inline-flex items-center gap-1 text-left text-[#C5CCD3] transition hover:text-[#1E6FB8]",
  row: "border-b border-[#5A6169]/50 transition",
  rowEven: "bg-[#2A2E33]",
  rowOdd: "bg-[#23272C]",
  rowHover: "hover:bg-[#32363C]",
  rowSelected:
    "bg-[rgba(30,111,184,0.16)] shadow-[inset_3px_0_0_#1E6FB8]",
  /** Critical compliance failure only */
  rowCritical:
    "bg-[rgba(179,58,58,0.14)] shadow-[inset_3px_0_0_#B33A3A]",
  td: "px-3 py-2.5 text-[#D5DBE0]",
} as const;

export const vfForm = {
  label:
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8B0B8]",
  hint: "mt-1.5 text-xs text-[#8A9199]",
  field:
    "h-10 w-full rounded-[3px] border border-[#5A6169] bg-[#23272C] px-3 text-sm font-medium text-[#F4F6F8] " +
    "outline-none transition placeholder:text-[#8A9199] " +
    "focus:border-[#1E6FB8] focus:shadow-[0_0_0_2px_rgba(30,111,184,0.28)] " +
    "disabled:cursor-not-allowed disabled:border-[#454A51] disabled:bg-[#2A2E33] disabled:text-[#8A9199]",
  fieldGroup: "flex w-full flex-col",
  checkbox:
    "mt-0.5 h-4 w-4 rounded-[3px] border border-[#5A6169] bg-[#23272C] accent-[#1E6FB8]",
} as const;

export const vfNav = {
  link:
    "rounded-[3px] border px-3 py-2 text-sm font-medium transition",
  linkIdle:
    "border-[#5A6169] bg-[#2A2E33] text-[#B8C0C8] hover:border-[#6B737C] hover:bg-[#3B3F45] hover:text-[#F4F6F8]",
  linkActive:
    "border-[#1E6FB8] bg-[rgba(30,111,184,0.16)] text-[#F4F6F8] shadow-[inset_3px_0_0_#1E6FB8]",
} as const;

/**
 * VeriWallet industrial safety tokens — aligned with VeriForge Hub / Core / PM.
 */

export const VW = {
  slate: "#2A2E33",
  graphite: "#3B3F45",
  iron: "#1C1F24",
  steel: "#5A6169",
  white: "#F4F6F8",
  safetyBlue: "#1E6FB8",
  safetyBlueDark: "#174F86",
  inspectionTeal: "#2F8F8C",
  mutedAmber: "#C89F3D",
  softGreen: "#4FAF6F",
  critical: "#B33A3A",
} as const;

export const vwSurface = {
  canvas: "bg-[#F4F6F8] text-[#2A2E33]",
  panel:
    "rounded-[6px] border border-[#2A2E33]/14 bg-white shadow-none text-[#2A2E33]",
  panelMuted:
    "rounded-[6px] border border-[#2A2E33]/14 bg-[#F4F6F8] shadow-none text-[#2A2E33]",
  slate:
    "rounded-[6px] border border-[#1F2328] bg-[#2A2E33] shadow-none text-[#F4F6F8]",
  graphite:
    "rounded-[6px] border border-[#2A2E33] bg-[#3B3F45] shadow-none text-[#F4F6F8]",
  inset:
    "rounded-[3px] border border-[#2A2E33]/12 bg-[#F4F6F8] shadow-none",
} as const;

export const vwBtn = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-[3px] border border-solid font-medium shadow-none " +
    "transition-[background-color,border-color,transform] duration-150 " +
    "hover:-translate-y-px active:translate-y-0 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0",
  primary:
    "border-[#174F86] bg-[#1E6FB8] text-[#F4F6F8] hover:bg-[#1A63A6]",
  secondary:
    "border-[#2A2E33] bg-[#3B3F45] text-[#F4F6F8] hover:bg-[#454A51]",
  slate:
    "border-[#1F2328] bg-[#2A2E33] text-[#F4F6F8] hover:bg-[#343940]",
  ghost:
    "border-[#2A2E33]/20 bg-transparent text-[#2A2E33] hover:bg-[#E8ECF0]",
  warning:
    "border-[#A8842F] bg-[#C89F3D] text-[#1C1A10] hover:bg-[#B89136]",
} as const;

export type VeriWalletTxStatus =
  | "completed"
  | "pending"
  | "flagged"
  | "critical";

export const vwTxBadge: Record<VeriWalletTxStatus, string> = {
  completed:
    "inline-flex items-center rounded-[3px] border border-[#3D8F58] bg-[#4FAF6F] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#0F1A12]",
  pending:
    "inline-flex items-center rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#F4F6F8]",
  flagged:
    "inline-flex items-center rounded-[3px] border border-[#A8842F] bg-[#C89F3D] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#1C1A10]",
  critical:
    "inline-flex items-center rounded-[3px] border border-[#8F2E2E] bg-[#B33A3A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#F4F6F8]",
};

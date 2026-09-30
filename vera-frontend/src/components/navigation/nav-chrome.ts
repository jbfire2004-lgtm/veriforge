/**
 * Shared industrial navigation chrome — Hub · VeriCore · VeriPM.
 * Top bar = slate · Module / side chrome = graphite · Active = safety blue.
 * Critical red indicators only for system alerts.
 */

export const navChrome = {
  /** Layer 1 — global top bar */
  topBar:
    "sticky top-0 z-40 shrink-0 border-b border-[#1F2328] bg-[#2A2E33] text-[#F4F6F8]",
  topBarInner:
    "mx-auto flex min-h-14 max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:min-h-16 sm:gap-x-4 sm:px-6",
  brand:
    "shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-[#F4F6F8] no-underline " +
    "transition-colors hover:text-[#2F85CC] focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A2E33]",
  divider: "hidden h-5 w-px shrink-0 bg-[#5A6169] sm:block",
  trailing: "ml-auto flex shrink-0 items-center gap-2",

  /** Always-on product switcher (Hub · Core · PM · FieldOS · VeriAgent) */
  productRail:
    "flex min-w-0 flex-1 flex-wrap items-center gap-1",
  productRailLink:
    "inline-flex shrink-0 items-center rounded-[3px] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#D5DBE0] no-underline " +
    "transition-colors hover:bg-[rgba(30,111,184,0.16)] hover:text-[#F4F6F8] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A2E33]",
  productRailLinkActive:
    "bg-[rgba(30,111,184,0.22)] text-[#F4F6F8]",

  /** Layer 2 — module bar (graphite secondary chrome) */
  moduleBar:
    "border-b border-[#2A2E33] bg-[#3B3F45] text-[#F4F6F8]",
  moduleBarInner:
    "mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6",
  moduleLabel:
    "truncate text-sm font-semibold tracking-tight text-[#F4F6F8]",
  moduleIcon: "h-4 w-4 shrink-0 text-[#1E6FB8]",
  moduleQuickAction:
    "inline-flex items-center gap-1.5 rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-3 py-1.5 " +
    "text-sm font-medium text-[#F4F6F8] no-underline shadow-none " +
    "transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1A63A6] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B3F45]",

  /** Breadcrumb strip under module bar */
  crumbBar:
    "border-b border-[#2A2E33]/12 bg-[#F4F6F8] px-4 py-2 sm:px-6",

  /** Dropdown trigger on dark chrome */
  triggerDark:
    "flex min-w-[180px] max-w-[280px] items-center gap-2 rounded-[3px] border border-[#5A6169] " +
    "bg-[#23272C] px-3 py-2 text-left text-[#F4F6F8] shadow-none transition " +
    "hover:border-[#1E6FB8]/50 hover:bg-[rgba(30,111,184,0.12)] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A2E33]",
  triggerDarkOpen: "border-[#1E6FB8] bg-[rgba(30,111,184,0.16)]",

  /** Dropdown menu panel */
  menu:
    "fixed z-[100] max-h-[min(70vh,480px)] overflow-y-auto rounded-[3px] border border-[#5A6169] " +
    "bg-[#3B3F45] shadow-none focus:outline-none",
  menuGroupLabel:
    "px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C] first:pt-2",
  menuSeparator: "mx-3 my-1.5 h-px bg-[#5A6169]/80",
  menuItem:
    "flex gap-3 border-b border-[#5A6169]/40 border-l-[3px] border-l-transparent px-4 py-2.5 last:border-b-0 " +
    "text-[#D5DBE0] transition-colors hover:bg-[rgba(30,111,184,0.16)] hover:text-[#F4F6F8] " +
    "focus:bg-[rgba(30,111,184,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E6FB8]",
  menuItemActive:
    "border-l-[#1E6FB8] bg-[rgba(30,111,184,0.2)] text-[#F4F6F8]",
  menuItemCritical:
    "text-[#F0DADA] hover:bg-[#2A2224]",

  /** Side nav (contextual / VeriForge / Core sidebar — not global module switcher) */
  sideBar:
    "flex w-64 shrink-0 flex-col border-r border-[#5A6169] bg-[#3B3F45] text-[#F4F6F8]",
  sideSectionLabel:
    "mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]",
  sideLink:
    "flex items-center gap-3 rounded-[3px] border border-transparent border-l-[3px] border-l-transparent px-3 py-2 text-sm font-medium " +
    "text-[#D5DBE0] transition-colors hover:bg-[rgba(30,111,184,0.16)] hover:text-[#F4F6F8]",
  sideLinkActive:
    "border-l-[#1E6FB8] bg-[rgba(30,111,184,0.2)] text-[#F4F6F8]",
  sideLinkCritical:
    "border-[#B33A3A]/40 text-[#F0DADA] hover:border-[#B33A3A] hover:bg-[#2A2224]",

  /** Account / icon controls on dark chrome */
  ghostOnDark:
    "text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.14)] hover:text-[#F4F6F8] " +
    "focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-[#2A2E33]",
} as const;

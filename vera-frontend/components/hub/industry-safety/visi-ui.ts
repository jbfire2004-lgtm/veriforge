/** Shared Industry Safety (VISI) UI — industrial safety platform surfaces */

export const visiFieldClass =
  "w-full rounded-[3px] border border-[#5A6169] bg-white px-3 py-2 text-sm text-[#2A2E33] shadow-none transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-[#8A9199] focus:border-[#1E6FB8] focus:outline-none focus:shadow-[0_0_0_3px_rgba(30,111,184,0.28)] " +
  "disabled:bg-[#F4F6F8] disabled:text-[#8A9199]";

export const visiLabelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]";

export const visiCardClass =
  "rounded-[6px] border border-[#2A2E33]/14 bg-white p-5 shadow-none";

export const visiCardMutedClass =
  "rounded-[6px] border border-dashed border-[#2A2E33]/14 bg-[#F4F6F8] p-6 shadow-none";

export const visiPanelClass =
  "rounded-[6px] border border-[#2A2E33]/14 bg-white p-5 shadow-none";

/** Segmented control — quiet active state (professional, not loud) */
export function visiSegmentClass(active: boolean): string {
  return active
    ? "flex-1 rounded-[6px] bg-white px-3 py-2 text-sm font-semibold text-[#2A2E33] ring-1 ring-[#2A2E33]/10 transition"
    : "flex-1 rounded-[6px] px-3 py-2 text-sm font-medium text-[#5A6169] transition hover:text-[#2A2E33]";
}

export const visiSegmentTrackClass =
  "flex gap-0.5 rounded-[6px] bg-[#E8ECF0] p-0.5";

export function visiTabClass(active: boolean): string {
  return active
    ? "rounded-[6px] bg-white px-4 py-2 text-sm font-semibold text-[#2A2E33] ring-1 ring-[#2A2E33]/10"
    : "rounded-[6px] px-4 py-2 text-sm font-medium text-[#5A6169] transition hover:text-[#2A2E33]";
}

export const visiPrimaryBtnClass =
  "inline-flex items-center justify-center rounded-[3px] border border-[#1F2328] bg-[#2A2E33] px-4 py-2 text-sm font-semibold text-[#F4F6F8] shadow-none " +
  "transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px hover:bg-[#343940] active:translate-y-0 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2";

export const visiSecondaryBtnClass =
  "inline-flex items-center justify-center rounded-[3px] border border-[#2A2E33] bg-[#3B3F45] px-4 py-2 text-sm font-medium text-[#F4F6F8] shadow-none " +
  "transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px hover:bg-[#454A51] active:translate-y-0 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2";

export const visiActionBtnClass =
  "inline-flex items-center justify-center rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-4 py-2 text-sm font-semibold text-[#F4F6F8] shadow-none " +
  "transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1A63A6] active:translate-y-0 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2";

export const visiWarningBtnClass =
  "inline-flex items-center justify-center rounded-[3px] border border-[#A8842F] bg-[#C89F3D] px-4 py-2 text-sm font-semibold text-[#1C1A10] shadow-none " +
  "transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px hover:bg-[#B89136] active:translate-y-0 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2";

/**
 * Heatmap / maturity cells — score shown with a quiet left rail, not solid color blocks.
 */
export function visiHeatClass(score: number): string {
  if (score >= 75)
    return "rounded-[6px] border border-[#2A2E33]/08 bg-white pl-3 shadow-[inset_3px_0_0_#2F8F8C]";
  if (score >= 55)
    return "rounded-[6px] border border-[#2A2E33]/08 bg-white pl-3 shadow-[inset_3px_0_0_#1E6FB8]";
  if (score >= 40)
    return "rounded-[6px] border border-[#2A2E33]/08 bg-white pl-3 shadow-[inset_3px_0_0_#C89F3D]";
  return "rounded-[6px] border border-[#2A2E33]/08 bg-white pl-3 shadow-[inset_3px_0_0_#B33A3A]";
}

export const visiPillClass =
  "inline-flex items-center rounded-[6px] border border-[#2A2E33]/10 bg-[#F4F6F8] px-2 py-0.5 text-[11px] font-medium text-[#5A6169]";

export const visiPillWarnClass =
  "inline-flex items-center rounded-[6px] border border-[#C89F3D]/40 bg-[#F8F1DC] px-2 py-0.5 text-[11px] font-medium text-[#6B5420]";

export const visiEyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]";

export const visiTitleClass = "text-sm font-semibold text-[#2A2E33]";

export const visiMutedClass = "text-xs text-[#5A6169]";

export const visiStatusBarClass =
  "flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#2A2E33]/12 bg-[#F4F6F8] px-4 py-2.5 text-sm text-[#5A6169]";

/** ISO-style section header with optional icon tile */
export function visiSectionHeaderClass(): string {
  return "mb-3 flex items-start gap-3 border-b border-[#2A2E33]/10 pb-3";
}

export const visiIconTileClass =
  "grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-[#2A2E33]/12 bg-[#E8ECF0] text-[#1E6FB8]";

export const visiTableWrapClass =
  "overflow-x-auto rounded-[6px] border border-[#2A2E33]/14 bg-white shadow-none";

export const visiTableRowSelectedClass =
  "bg-[rgba(30,111,184,0.12)] shadow-[inset_3px_0_0_#1E6FB8]";

export const visiTableRowCriticalClass =
  "bg-[rgba(179,58,58,0.1)] shadow-[inset_3px_0_0_#B33A3A]";

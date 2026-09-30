import { motionClass } from "./motion";

/**
 * Industrial safety component tokens — Hub · VeriCore · VeriPM.
 * Matte surfaces, thin borders, safety-blue focus, critical red for failures only.
 */

const btnMotion =
  "will-change-transform transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out " +
  "hover:-translate-y-px active:translate-y-0 active:brightness-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0";

export const buttonTokens = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius,3px)] border border-solid font-medium " +
    "shadow-none " +
    motionClass.base +
    " " +
    btnMotion +
    " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]",
  primary:
    "border-[var(--btn-primary-border)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] " +
    "hover:bg-[var(--btn-primary-bg-hover)] hover:border-[var(--btn-secondary-bg)]",
  secondary:
    "border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] " +
    "hover:bg-[var(--btn-secondary-bg-hover)]",
  action:
    "border-[var(--btn-action-border)] bg-[var(--btn-action-bg)] text-[var(--btn-action-fg)] " +
    "hover:bg-[var(--btn-action-bg-hover)]",
  success:
    "border-[var(--btn-success-border)] bg-[var(--btn-success-bg)] text-[var(--btn-success-fg)] " +
    "hover:bg-[var(--btn-success-bg-hover)]",
  warning:
    "border-[var(--btn-warning-border)] bg-[var(--btn-warning-bg)] text-[var(--btn-warning-fg)] " +
    "hover:bg-[var(--btn-warning-bg-hover)]",
  critical:
    "border-[var(--btn-critical-border)] bg-[var(--btn-critical-bg)] text-[var(--btn-critical-fg)] " +
    "hover:bg-[var(--btn-critical-bg-hover)]",
  danger:
    "border-[var(--btn-warning-border)] bg-[var(--btn-warning-bg)] text-[var(--btn-warning-fg)] " +
    "hover:bg-[var(--btn-warning-bg-hover)]",
  ghost:
    "border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]",
  outline:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--muted)]",
  disabled: "opacity-50 pointer-events-none",
} as const;

export const inputTokens = {
  base:
    "w-full rounded-[var(--input-radius,3px)] border border-[var(--input-border)] bg-[var(--input-bg)] " +
    "px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-sm)] text-[var(--foreground)] " +
    "shadow-none " +
    motionClass.base +
    " placeholder:text-[var(--muted-foreground)] " +
    "transition-[border-color,box-shadow] duration-150 " +
    "focus-visible:border-[var(--input-border-focus)] focus-visible:outline-none " +
    "focus-visible:shadow-[0_0_0_3px_var(--input-focus-ring,rgba(30,111,184,0.28))] " +
    "focus-visible:ring-0",
  error:
    "border-[var(--danger)] focus-visible:border-[var(--danger)] " +
    "focus-visible:shadow-[0_0_0_3px_rgba(179,58,58,0.25)]",
} as const;

export const cardTokens = {
  base:
    "rounded-[var(--card-radius,6px)] border border-[var(--card-border)] bg-[var(--card-bg)] " +
    "shadow-none text-[var(--foreground)]",
  muted:
    "rounded-[var(--card-radius,6px)] border border-[var(--card-border)] bg-[var(--card-bg-muted,#f4f6f8)] " +
    "shadow-none text-[var(--foreground)]",
  header:
    "flex items-start gap-3 border-b border-[var(--panel-header-border,var(--border))] pb-[var(--space-3)]",
  iconTile:
    "grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-[var(--card-border)] " +
    "bg-[var(--panel-icon-bg,#e8ecf0)] text-[var(--panel-icon-fg,#1e6fb8)]",
} as const;

export const tableTokens = {
  wrap:
    "relative w-full overflow-x-auto rounded-[var(--card-radius,6px)] border border-[var(--table-border)] " +
    "bg-[var(--card-bg)] shadow-none",
  header:
    "bg-[var(--table-header-bg)] text-[var(--table-header-fg,var(--foreground))] font-semibold",
  row:
    "border-b border-[var(--table-border)] transition-colors duration-150 " +
    "odd:bg-[var(--table-row-odd,#f4f6f8)] even:bg-[var(--table-row-even,#ffffff)] " +
    "hover:bg-[var(--table-row-hover)]",
  rowSelected:
    "!bg-[var(--table-row-selected)] shadow-[inset_3px_0_0_var(--table-row-selected-rail)] " +
    "hover:!bg-[var(--table-row-selected)]",
  /** Critical compliance failure only — never for routine selection */
  rowCritical:
    "!bg-[var(--table-row-critical)] shadow-[inset_3px_0_0_var(--table-row-critical-rail)] " +
    "hover:!bg-[var(--table-row-critical)]",
  cell: "px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-sm)] text-[var(--foreground)]",
  headCell:
    "h-11 whitespace-nowrap px-[var(--space-4)] text-left align-middle text-[11px] font-semibold " +
    "uppercase tracking-[0.06em] text-[var(--muted-foreground)]",
} as const;

export const badgeTokens = {
  success: "bg-[var(--badge-success-bg)] text-[var(--badge-success-fg)]",
  warning: "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-fg)]",
  danger: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-fg)]",
  info: "bg-[var(--badge-info-bg)] text-[var(--badge-info-fg)]",
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
} as const;

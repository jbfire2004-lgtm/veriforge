import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography } from "./theme";
import { vfForm } from "./surfaces";

function FieldFrame({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={vfForm.fieldGroup}>
      <span className={cn(veriforgeTypography.heading, vfForm.label)}>{label}</span>
      {children}
      {hint ? <span className={vfForm.hint}>{hint}</span> : null}
    </label>
  );
}

export type VeriForgeOption = { label: string; value: string };

export function VeriForgeTextField(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: string;
  },
) {
  const { label, hint, className, ...rest } = props;
  return (
    <FieldFrame label={label} hint={hint}>
      <input className={cn(vfForm.field, className)} {...rest} />
    </FieldFrame>
  );
}

export function VeriForgeSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    hint?: string;
    options: VeriForgeOption[];
  },
) {
  const { label, hint, className, options, ...rest } = props;
  return (
    <FieldFrame label={label} hint={hint}>
      <select className={cn(vfForm.field, "appearance-none pr-10", className)} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export function VeriForgeTextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    hint?: string;
  },
) {
  const { label, hint, className, ...rest } = props;
  return (
    <FieldFrame label={label} hint={hint}>
      <textarea
        className={cn(
          vfForm.field,
          "h-auto min-h-[96px] resize-y py-2.5 leading-relaxed",
          className,
        )}
        {...rest}
      />
    </FieldFrame>
  );
}

export function VeriForgeCheckbox({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input type="checkbox" className={vfForm.checkbox} {...props} />
      <span className="space-y-1">
        <span className={cn(veriforgeTypography.body, "text-sm font-medium text-[#F4F6F8]")}>
          {label}
        </span>
        {hint ? <span className="block text-xs text-[#8A9199]">{hint}</span> : null}
      </span>
    </label>
  );
}

export function VeriForgeToggle({
  checked,
  onCheckedChange,
  label,
  hint,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[3px] border border-[#5A6169] bg-[#2A2E33] px-3 py-2.5">
      <span className="space-y-1">
        <span
          className={cn(
            veriforgeTypography.heading,
            "text-[12px] font-medium text-[#F4F6F8]",
          )}
        >
          {label}
        </span>
        {hint ? <span className="block text-xs text-[#8A9199]">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-12 rounded-[3px] border transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]/50",
          checked
            ? "border-[#174F86] bg-[#1E6FB8]"
            : "border-[#5A6169] bg-[#3B3F45]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-[2px] border border-[#8A9199] bg-[#F4F6F8] transition-all",
            checked ? "left-[26px]" : "left-1",
          )}
        />
      </button>
    </label>
  );
}

/** Structured industrial form layout wrapper */
export function VeriForgeForm({
  children,
  className,
  columns = 1,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "md:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Industrial dropdown — graphite field, safety-blue focus, matte menu.
 * Prefer this for structured enterprise selectors.
 */
export function VeriForgeDropdown({
  label,
  hint,
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled,
  className,
}: {
  label: string;
  hint?: string;
  options: VeriForgeOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn(vfForm.fieldGroup, "relative", className)}>
      <span className={cn(veriforgeTypography.heading, vfForm.label)}>{label}</span>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          vfForm.field,
          "flex items-center justify-between text-left",
          open && "border-[#1E6FB8] shadow-[0_0_0_2px_rgba(30,111,184,0.28)]",
        )}
      >
        <span className={selected ? "text-[#F4F6F8]" : "text-[#8A9199]"}>
          {selected?.label ?? placeholder}
        </span>
        <span className="text-[#A8B0B8]" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[3px] border border-[#5A6169] bg-[#3B3F45] py-1 shadow-none"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm font-medium transition",
                    active
                      ? "bg-[rgba(30,111,184,0.2)] text-[#F4F6F8]"
                      : "text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.14)] hover:text-[#F4F6F8]",
                  )}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {hint ? <span className={vfForm.hint}>{hint}</span> : null}
    </div>
  );
}


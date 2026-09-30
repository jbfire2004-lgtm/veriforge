"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { sfCn } from "../theme/cn";

export type SfSelectOption = {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
};

type Props = {
  label: string;
  options: SfSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
};

export function SfSearchSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Search…",
  disabled,
  required,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.sublabel?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--sf-text)]">
        {label}
        {required ? <span className="text-[var(--sf-danger)]"> *</span> : null}
      </label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        className={sfCn(
          "flex w-full items-center gap-2 rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 py-2.5 text-left text-sm transition-all",
          open && "border-[var(--sf-primary)] shadow-[var(--sf-shadow-glow)]",
          !disabled && "hover:border-[var(--sf-slate-400)]",
        )}
        onClick={() => setOpen((o) => !o)}
      >
        {selected?.icon}
        <span className="min-w-0 flex-1 truncate">
          {selected?.label ?? (
            <span className="text-[var(--sf-text-muted)]">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={sfCn(
            "h-4 w-4 shrink-0 text-[var(--sf-text-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div
          className="sf-animate-in absolute z-30 mt-1 w-full overflow-hidden rounded-[var(--sf-radius-md)] border border-[var(--sf-border)] bg-[var(--sf-surface)] shadow-[var(--sf-shadow-lg)]"
          role="listbox"
        >
          <div className="flex items-center gap-2 border-b border-[var(--sf-border)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--sf-text-muted)]" />
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter…"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  className={sfCn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--sf-primary-muted)]",
                    o.value === value && "bg-[var(--sf-primary-muted)] text-[var(--sf-primary)]",
                  )}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {o.icon}
                  <span>
                    <span className="block font-medium">{o.label}</span>
                    {o.sublabel ? (
                      <span className="text-xs text-[var(--sf-text-muted)]">{o.sublabel}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

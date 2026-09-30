"use client";

import { ChevronDown, Plus, Search } from "lucide-react";
import { startTransition, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

export type JhaSelectEntry = {
  id?: string;
  description: string;
  category?: string;
  controlType?: string;
  controlClass?: string;
  defaultEnergyTypes?: string[];
  reason?: string;
  count?: number;
};

export const CONTROL_TYPE_OPTIONS = [
  { value: "elimination", label: "Elimination", order: 1 },
  { value: "substitution", label: "Substitution", order: 2 },
  { value: "engineering", label: "Engineering controls", order: 3 },
  { value: "administrative", label: "Administrative controls", order: 4 },
  { value: "ppe", label: "PPE", order: 5 },
] as const;

export function controlTypeLabel(value: string): string {
  return CONTROL_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function controlClassLabel(value?: string): string {
  return value === "direct" ? "Direct control" : "Alternative control";
}

type GroupedOptions = {
  group: string;
  items: JhaSelectEntry[];
};

type Props = {
  label: string;
  mode: "hazard" | "control";
  entries: JhaSelectEntry[];
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  defaultCategory?: string;
  onSelect: (entry: JhaSelectEntry) => void;
  onCreateCustom: (text: string, meta: { category?: string; controlType?: string }) => void;
};

export function JhaCreatableSelect({
  label,
  mode,
  entries,
  disabled,
  placeholder,
  helperText,
  defaultCategory,
  onSelect,
  onCreateCustom,
}: Props) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [groupFilter, setGroupFilter] = useState("all");
  const [classFilter, setClassFilter] = useState<"all" | "direct" | "alternative">("all");
  const [customCategory, setCustomCategory] = useState(defaultCategory ?? "Field");
  const [customControlType, setCustomControlType] = useState("administrative");

  useEffect(() => {
    if (defaultCategory) setCustomCategory(defaultCategory);
  }, [defaultCategory]);

  const groupOptions = useMemo(() => {
    const set = new Set<string>(["Field"]);
    for (const e of entries) {
      const g = mode === "hazard" ? e.category ?? "Other" : e.controlType ?? "other";
      set.add(g);
    }
    if (defaultCategory) set.add(defaultCategory);
    return Array.from(set).sort((a, b) => {
      if (mode === "control") {
        const oa = CONTROL_TYPE_OPTIONS.find((o) => o.value === a)?.order ?? 99;
        const ob = CONTROL_TYPE_OPTIONS.find((o) => o.value === b)?.order ?? 99;
        return oa - ob;
      }
      return a.localeCompare(b);
    });
  }, [entries, mode, defaultCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const group = mode === "hazard" ? e.category ?? "Other" : e.controlType ?? "other";
      if (groupFilter !== "all" && group !== groupFilter) return false;
      if (mode === "control" && classFilter !== "all") {
        const cls = e.controlClass ?? "alternative";
        if (cls !== classFilter) return false;
      }
      if (!q) return true;
      return (
        e.description.toLowerCase().includes(q) ||
        group.toLowerCase().includes(q) ||
        controlTypeLabel(group).toLowerCase().includes(q) ||
        (e.controlClass?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [entries, query, groupFilter, classFilter, mode]);

  const grouped = useMemo((): GroupedOptions[] => {
    const map = new Map<string, JhaSelectEntry[]>();
    for (const e of filtered) {
      const key = mode === "hazard" ? e.category ?? "Other" : e.controlType ?? "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (mode === "control") {
          const oa = CONTROL_TYPE_OPTIONS.find((o) => o.value === a)?.order ?? 99;
          const ob = CONTROL_TYPE_OPTIONS.find((o) => o.value === b)?.order ?? 99;
          return oa - ob;
        }
        return a.localeCompare(b);
      })
      .map(([group, items]) => ({ group, items }));
  }, [filtered, mode]);

  const flatOptions = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped],
  );

  const indexedGroups = useMemo(() => {
    let index = 0;
    return grouped.map(({ group, items }) => ({
      group,
      items: items.map((entry) => {
        const current = index;
        index += 1;
        return { entry, index: current };
      }),
    }));
  }, [grouped]);

  const showCreateRow = query.trim().length > 0 && !flatOptions.some(
    (e) => e.description.toLowerCase() === query.trim().toLowerCase(),
  );

  const totalRows = flatOptions.length + (showCreateRow ? 1 : 0);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, groupFilter, classFilter]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = useCallback(
    (entry: JhaSelectEntry) => {
      setQuery("");
      setOpen(false);
      startTransition(() => {
        onSelect(entry);
      });
    },
    [onSelect],
  );

  const createCustom = useCallback(() => {
    const text = query.trim();
    if (!text) return;
    setQuery("");
    setOpen(false);
    startTransition(() => {
      onCreateCustom(text, {
        category: customCategory,
        controlType: customControlType,
      });
    });
  }, [query, customCategory, customControlType, onCreateCustom]);

  const activateRow = useCallback(
    (index: number) => {
      if (index < flatOptions.length) {
        pick(flatOptions[index]);
      } else if (showCreateRow) {
        createCustom();
      }
    },
    [flatOptions, showCreateRow, pick, createCustom],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, totalRows - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && totalRows > 0) {
        activateRow(activeIndex);
      } else if (query.trim()) {
        createCustom();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--sf-text)]">
        {label}
      </label>
      {helperText ? (
        <p className="text-xs text-[var(--sf-text-muted)]">{helperText}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 py-2 text-sm"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          disabled={disabled}
          aria-label={mode === "hazard" ? "Filter by hazard type" : "Filter by control type"}
        >
          <option value="all">
            {mode === "hazard" ? "All hazard types" : "All control types"}
          </option>
          {groupOptions.map((g) => (
            <option key={g} value={g}>
              {mode === "control" ? controlTypeLabel(g) : g}
            </option>
          ))}
        </select>

        {mode === "control" ? (
          <select
            className="rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 py-2 text-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value as "all" | "direct" | "alternative")}
            disabled={disabled}
            aria-label="Filter by control class"
          >
            <option value="all">All — Direct & Alternative</option>
            <option value="direct">Direct controls</option>
            <option value="alternative">Alternative controls</option>
          </select>
        ) : null}

        {mode === "hazard" ? (
          <select
            className="rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 py-2 text-sm"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            disabled={disabled}
            aria-label="Category for custom hazard"
          >
            {groupOptions.map((g) => (
              <option key={g} value={g}>
                Custom → {g}
              </option>
            ))}
            {!groupOptions.includes(customCategory) ? (
              <option value={customCategory}>{customCategory}</option>
            ) : null}
          </select>
        ) : (
          <select
            className="rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 py-2 text-sm"
            value={customControlType}
            onChange={(e) => setCustomControlType(e.target.value)}
            disabled={disabled}
            aria-label="Control type for custom entry"
          >
            {CONTROL_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Custom → {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="relative">
        <div
          className={sfCn(
            "flex items-center gap-2 rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 py-2.5 transition-all",
            open && "border-[var(--sf-primary)] shadow-[var(--sf-shadow-glow)]",
            disabled && "opacity-60",
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--sf-text-muted)]" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={
              placeholder ??
              (mode === "hazard"
                ? "Type or select a hazard…"
                : "Type or select a control measure…")
            }
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--sf-text-muted)]"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-listbox`}
          />
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 rounded p-0.5 text-[var(--sf-text-muted)] hover:bg-[var(--sf-surface-muted)]"
            aria-label="Toggle list"
            onClick={() => {
              setOpen((o) => !o);
              inputRef.current?.focus();
            }}
          >
            <ChevronDown className={sfCn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>

        {open && !disabled ? (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="sf-animate-in absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-[var(--sf-radius-md)] border border-[var(--sf-border)] bg-[var(--sf-surface)] shadow-[var(--sf-shadow-lg)]"
          >
            {grouped.length === 0 && !showCreateRow ? (
              <p className="px-3 py-4 text-sm text-[var(--sf-text-muted)]">
                No matches. Type a description and press Enter to add a custom{" "}
                {mode === "hazard" ? "hazard" : "control"}.
              </p>
            ) : null}

            {indexedGroups.map(({ group, items }) => (
              <div key={group}>
                <div className="sticky top-0 border-b border-[var(--sf-border)] bg-[var(--sf-surface-muted)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
                  {mode === "control" ? controlTypeLabel(group) : group}
                  <span className="ml-1 font-normal normal-case">({items.length})</span>
                </div>
                <ul>
                  {items.map(({ entry, index: idx }) => (
                    <li key={entry.id ?? `${group}-${entry.description}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={activeIndex === idx}
                        className={sfCn(
                          "flex w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--sf-primary-muted)]",
                          activeIndex === idx && "bg-[var(--sf-primary-muted)]",
                        )}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => pick(entry)}
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          {mode === "control" ? (
                            <span
                              className={sfCn(
                                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                entry.controlClass === "direct"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-slate-200 text-slate-700",
                              )}
                            >
                              {entry.controlClass === "direct" ? "Direct" : "Alt"}
                            </span>
                          ) : null}
                          <span className="line-clamp-2">{entry.description}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {showCreateRow ? (
              <div className="border-t border-[var(--sf-border)]">
                <button
                  type="button"
                  role="option"
                  aria-selected={activeIndex === flatOptions.length}
                  className={sfCn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-[var(--sf-primary)] transition-colors hover:bg-teal-50",
                    activeIndex === flatOptions.length && "bg-teal-50",
                  )}
                  onMouseEnter={() => setActiveIndex(flatOptions.length)}
                  onClick={createCustom}
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>
                    Add custom {mode}: &ldquo;{query.trim()}&rdquo;
                    {mode === "hazard" ? (
                      <span className="ml-1 font-normal text-[var(--sf-text-muted)]">
                        ({customCategory})
                      </span>
                    ) : (
                      <span className="ml-1 font-normal text-[var(--sf-text-muted)]">
                        ({controlTypeLabel(customControlType)})
                      </span>
                    )}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

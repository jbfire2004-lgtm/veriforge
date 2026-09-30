"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";

export type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value = "",
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "Search…",
  className,
}: SearchBarProps) {
  const [internal, setInternal] = React.useState(value);

  React.useEffect(() => {
    setInternal(value);
  }, [value]);

  React.useEffect(() => {
    if (!onDebouncedChange) return;
    const t = window.setTimeout(() => onDebouncedChange(internal), debounceMs);
    return () => window.clearTimeout(t);
  }, [internal, debounceMs, onDebouncedChange]);

  return (
    <section className={cn("relative max-w-md flex-1", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
        aria-hidden
      />
      <Input
        type="search"
        value={internal}
        onChange={(e) => {
          setInternal(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className="rounded-[var(--radius-md)] pl-10"
        aria-label="Search"
      />
      {internal ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          aria-label="Clear search"
          onClick={() => {
            setInternal("");
            onChange?.("");
            onDebouncedChange?.("");
          }}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  );
}

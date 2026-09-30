"use client";

export function GlobalSearch() {
  return (
    <input
      type="search"
      placeholder="Search people, providers, jobs, safety topics…"
      className="w-full max-w-xl rounded-full border border-border bg-muted/40 px-4 py-2 text-sm outline-none ring-vera-teal/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
      aria-label="Global search"
    />
  );
}

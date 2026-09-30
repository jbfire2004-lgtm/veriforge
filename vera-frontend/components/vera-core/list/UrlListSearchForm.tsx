"use client";

import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";

export type UrlListSearchFormProps = {
  placeholder?: string;
  paramName?: string;
  /** Extra hidden fields preserved on submit (e.g. sort, filter). */
  preserveParams?: string[];
  className?: string;
};

export function UrlListSearchForm({
  placeholder = "Search…",
  paramName = "search",
  preserveParams = [],
  className,
}: UrlListSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    for (const key of preserveParams) {
      const v = searchParams?.get(key);
      if (v) next.set(key, v);
    }
    const q = String(fd.get(paramName) ?? "").trim();
    if (q) next.set(paramName, q);
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={className ?? "flex flex-wrap items-end gap-3"}
    >
      <section className="space-y-2">
        <Label htmlFor="url-list-search" className="sr-only">
          Search
        </Label>
        <Input
          id="url-list-search"
          name={paramName}
          type="search"
          placeholder={placeholder}
          defaultValue={searchParams?.get(paramName) ?? ""}
          className="w-full min-w-[12rem] sm:w-72 rounded-lg border-[var(--border)]"
        />
      </section>
      <Button type="submit" variant="primary" size="md">
        <Search className="h-4 w-4" aria-hidden />
        Search
      </Button>
    </form>
  );
}

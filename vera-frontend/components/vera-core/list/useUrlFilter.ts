"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlFilter(paramName = "filter") {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const active = searchParams?.get(paramName) ?? "";

  const setFilter = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      if (!id || id === active) {
        next.delete(paramName);
      } else {
        next.set(paramName, id);
      }
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [active, paramName, pathname, router, searchParams]
  );

  return { activeFilter: active, onFilterChange: setFilter };
}

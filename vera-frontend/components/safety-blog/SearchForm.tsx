"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonStyles } from "@/components/ui";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      className="flex gap-vera-2"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        router.push(`/safety/search?${params.toString()}`);
      }}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search safety topics…"
        className="flex-1 rounded-lg border border-vera-border px-vera-3 py-vera-2 text-sm"
        aria-label="Search safety articles"
      />
      <button type="submit" className={buttonStyles({ variant: "primary", size: "md" })}>
        Search
      </button>
    </form>
  );
}

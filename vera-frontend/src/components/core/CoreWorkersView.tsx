"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, User } from "lucide-react";
import { searchWorkers } from "@/lib/api/vera-core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type WorkerRow = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  companyLinks?: Array<{ company?: { name: string } }>;
};

export function CoreWorkersView() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchWorkers({ q: query.trim(), limit: 50 });
      setRows(data as WorkerRow[]);
    } catch {
      setError("Search failed — check API connection.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) void search();
    }, 400);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, union #…"
            className="pl-9"
            aria-label="Search workers"
          />
        </div>
        <Button type="button" onClick={() => void search()} disabled={loading}>
          Search
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-amber-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Searching…</p>
      ) : rows.length === 0 && query.trim() ? (
        <p className="text-sm text-slate-500">No workers found.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {rows.map((w) => (
            <li key={w.id}>
              <Link
                href={`/core/workers/${w.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50"
              >
                <User className="h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {w.firstName} {w.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {[w.email, w.phone, w.companyLinks?.[0]?.company?.name]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="text-sm text-teal-700">Profile →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

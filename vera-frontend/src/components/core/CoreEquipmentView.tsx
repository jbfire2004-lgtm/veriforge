"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HardHat, Search } from "lucide-react";
import { searchEquipment } from "@/lib/api/vera-core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EquipmentRow = {
  id: number;
  name: string;
  serialNumber?: string | null;
  assetTag?: string | null;
  equipmentLinks?: Array<{ company?: { name: string }; complianceStatus?: string }>;
};

export function CoreEquipmentView() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchEquipment({ q: query.trim(), limit: 50 });
      setRows(data as EquipmentRow[]);
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
            placeholder="Search by name, serial, asset tag…"
            className="pl-9"
            aria-label="Search equipment"
          />
        </div>
        <Button type="button" onClick={() => void search()} disabled={loading}>
          Search
        </Button>
      </div>

      {error ? <p className="text-sm text-amber-700" role="alert">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Searching…</p>
      ) : rows.length === 0 && query.trim() ? (
        <p className="text-sm text-slate-500">No equipment found.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {rows.map((e) => (
            <li key={e.id}>
              <Link
                href={`/core/equipment/${e.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50"
              >
                <HardHat className="h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{e.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[e.serialNumber, e.assetTag, e.equipmentLinks?.[0]?.company?.name]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {e.equipmentLinks?.[0]?.complianceStatus ?? "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

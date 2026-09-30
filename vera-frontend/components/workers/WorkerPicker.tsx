"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, getAccessToken } from "@/lib/api-fetch";

export type WorkerPickerOption = {
  id: number;
  firstName: string;
  lastName: string;
  company?: { name: string } | null;
};

export function WorkerPicker({
  value,
  onChange,
  placeholder = "Search workers by name…",
}: {
  value: number | null;
  onChange: (workerId: number | null, worker?: WorkerPickerOption) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [options, setOptions] = useState<WorkerPickerOption[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${API_URL}/api/v1/core/workers/search?q=${encodeURIComponent(term)}&limit=12`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as Array<
        WorkerPickerOption & {
          companyLinks?: Array<{ company?: { name: string } | null }>;
        }
      >;
      setOptions(
        data.map((worker) => ({
          id: worker.id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          company:
            worker.company ??
            worker.companyLinks?.find((link) => link.company)?.company ??
            null,
        })),
      );
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void search(q), 300);
    return () => clearTimeout(t);
  }, [q, search]);

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading ? (
        <p className="text-xs text-slate-500">Searching…</p>
      ) : null}
      {options.length ? (
        <ul className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white text-sm shadow-sm">
          {options.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left hover:bg-slate-50 ${
                  value === w.id ? "bg-teal-50 font-medium" : ""
                }`}
                onClick={() => {
                  onChange(w.id, w);
                  setQ(`${w.firstName} ${w.lastName}`);
                  setOptions([]);
                }}
              >
                {w.firstName} {w.lastName}
                {w.company?.name ? (
                  <span className="ml-2 text-xs text-slate-500">
                    {w.company.name}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {value != null ? (
        <p className="text-xs text-slate-600">Selected worker ID: {value}</p>
      ) : null}
    </div>
  );
}

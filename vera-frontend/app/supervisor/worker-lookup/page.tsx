"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

export default function WorkerLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // SEARCH WORKERS
  // ---------------------------------------------
  async function searchWorkers() {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const data = await apiGet(
        `/api/v1/core/workers/search?q=${encodeURIComponent(query)}`
      );
      setResults(data);
    } catch (err) {
      console.error("Worker search failed", err);
    } finally {
      setLoading(false);
    }
  }

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(searchWorkers, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <main className="p-6 bg-black text-white min-h-screen space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-center">Worker Lookup</h1>

      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search by name, ID, or partial match…"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-400 text-sm">Searching…</p>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.length === 0 && query.trim() && !loading && (
          <p className="text-gray-500">No workers found.</p>
        )}

        {results.map((worker) => (
          <a
            key={worker.id}
            href={`/supervisor/worker/${worker.id}`}
            className="block p-4 bg-gray-900 rounded border border-gray-700 hover:bg-gray-800"
          >
            <p className="font-semibold">
              {worker.firstName} {worker.lastName}
            </p>
            <p className="text-xs text-gray-400">ID: {worker.id}</p>
            <p className="text-xs text-gray-500">
              Company: {worker.company?.name || "N/A"}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
